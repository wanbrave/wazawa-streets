import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { User, Property, WalletTransaction, AdminAuditLog } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, User as UserIcon, Home, Receipt, Clock, CheckCircle, XCircle, FileEdit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { apiRequest, queryClient } from '@/lib/queryClient';

export default function AdminPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('users');

  // Loading state
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }
  
  // Redirect if not admin
  if (user.role !== 'admin') {
    toast({
      title: "Access Denied",
      description: "You don't have permission to access the admin panel.",
      variant: "destructive"
    });
    setLocation('/');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">Redirecting to homepage...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your platform and users</p>
        </div>
        <Badge variant="outline" className="px-4 py-1">
          Admin: {user.username}
        </Badge>
      </div>
      
      <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="users" className="flex gap-2 items-center">
            <UserIcon className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger value="properties" className="flex gap-2 items-center">
            <Home className="h-4 w-4" />
            <span>Properties</span>
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex gap-2 items-center">
            <Receipt className="h-4 w-4" />
            <span>Transactions</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex gap-2 items-center">
            <Clock className="h-4 w-4" />
            <span>Audit Log</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <UsersTab />
        </TabsContent>
        
        <TabsContent value="properties">
          <PropertiesTab />
        </TabsContent>
        
        <TabsContent value="transactions">
          <TransactionsTab />
        </TabsContent>
        
        <TabsContent value="audit">
          <AuditTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UsersTab() {
  const { toast } = useToast();
  
  const { data: users, isLoading, error } = useQuery<User[], Error>({
    queryKey: ['/api/admin/users'],
    refetchInterval: 60000 // Refresh every minute
  });
  
  const activateUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest('PATCH', `/api/admin/users/${userId}`, { isVerified: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['/api/admin/users']});
      toast({
        title: "User Activated",
        description: "User has been activated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Action Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const deactivateUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest('PATCH', `/api/admin/users/${userId}`, { isVerified: false });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['/api/admin/users']});
      toast({
        title: "User Deactivated",
        description: "User has been deactivated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Action Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center my-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Users</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error.message}</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>Manage all users on the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>List of all registered users</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Wallet Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users && users.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.fullName || '-'}</TableCell>
                <TableCell>{user.email || '-'}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin' ? 'destructive' : 'default'}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>TZS {user.walletBalance.toLocaleString()}</TableCell>
                <TableCell>
                  {user.isVerified ? (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                      Pending
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {user.isVerified ? (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => deactivateUserMutation.mutate(user.id)}
                        disabled={deactivateUserMutation.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Deactivate
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => activateUserMutation.mutate(user.id)}
                        disabled={activateUserMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Activate
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function PropertiesTab() {
  const { toast } = useToast();
  
  const { data: properties, isLoading, error } = useQuery<Property[], Error>({
    queryKey: ['/api/admin/properties'],
    refetchInterval: 60000 // Refresh every minute
  });
  
  const updatePropertyMutation = useMutation({
    mutationFn: async ({ propertyId, data }: { propertyId: number, data: any }) => {
      return apiRequest('PATCH', `/api/admin/properties/${propertyId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['/api/admin/properties']});
      toast({
        title: "Property Updated",
        description: "Property has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const changePropertyFilter = (propertyId: number, filter: string) => {
    updatePropertyMutation.mutate({ 
      propertyId, 
      data: { filter } 
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center my-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error.message}</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Properties</CardTitle>
        <CardDescription>Manage all properties on the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>List of all properties</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Filter</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties && properties.map(property => (
              <TableRow key={property.id}>
                <TableCell>{property.id}</TableCell>
                <TableCell>{property.title}</TableCell>
                <TableCell>{property.location}, {property.city}</TableCell>
                <TableCell>{property.price}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    property.status === 'Ready' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : property.status === 'Rented'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }>
                    {property.status}
                  </Badge>
                </TableCell>
                <TableCell>{property.type}</TableCell>
                <TableCell>
                  <Badge variant={
                    property.filter === 'Available' 
                      ? 'default'
                      : property.filter === 'Funded'
                      ? 'secondary'
                      : 'outline'
                  }>
                    {property.filter}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => changePropertyFilter(property.id, 'Available')}
                      disabled={property.filter === 'Available' || updatePropertyMutation.isPending}
                    >
                      Available
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => changePropertyFilter(property.id, 'Funded')}
                      disabled={property.filter === 'Funded' || updatePropertyMutation.isPending}
                    >
                      Funded
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => changePropertyFilter(property.id, 'Exited')}
                      disabled={property.filter === 'Exited' || updatePropertyMutation.isPending}
                    >
                      Exited
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function TransactionsTab() {
  const { data: transactions, isLoading, error } = useQuery<WalletTransaction[], Error>({
    queryKey: ['/api/admin/transactions'],
    refetchInterval: 60000 // Refresh every minute
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center my-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error.message}</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
        <CardDescription>View all financial transactions on the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>List of all transactions</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions && transactions.map(transaction => (
              <TableRow key={transaction.id}>
                <TableCell>{transaction.id}</TableCell>
                <TableCell>{transaction.userId}</TableCell>
                <TableCell>
                  <Badge variant={
                    transaction.type === 'deposit' 
                      ? 'default'
                      : transaction.type === 'investment'
                      ? 'secondary'
                      : 'destructive'
                  }>
                    {transaction.type}
                  </Badge>
                </TableCell>
                <TableCell className={
                  transaction.amount > 0 
                    ? 'text-emerald-600 font-medium' 
                    : 'text-red-600 font-medium'
                }>
                  {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()} TZS
                </TableCell>
                <TableCell>{transaction.method}</TableCell>
                <TableCell>{transaction.organization}</TableCell>
                <TableCell>{transaction.account}</TableCell>
                <TableCell>{new Date(transaction.date).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function AuditTab() {
  const { data: auditLogs, isLoading, error } = useQuery<AdminAuditLog[], Error>({
    queryKey: ['/api/admin/audit-logs'],
    refetchInterval: 60000 // Refresh every minute
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center my-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error.message}</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Log</CardTitle>
        <CardDescription>Track all administrative actions on the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>List of all admin actions</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Admin ID</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Entity ID</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditLogs && auditLogs.map(log => (
              <TableRow key={log.id}>
                <TableCell>{log.id}</TableCell>
                <TableCell>{log.adminId}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell>{log.entityType}</TableCell>
                <TableCell>{log.entityId}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {log.details || '-'}
                </TableCell>
                <TableCell>{log.ipAddress || '-'}</TableCell>
                <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}