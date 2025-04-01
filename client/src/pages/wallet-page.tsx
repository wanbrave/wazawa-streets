import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { BadgePlus, BadgeMinus, Clock, CreditCard, Building, Star } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { MobileHeader } from "@/components/mobile-header";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AddCardForm } from "@/components/add-card-form";
import { PaymentCardDisplay } from "@/components/payment-card-display";

// Type for wallet transaction
type WalletTransaction = {
  id: number;
  userId: number;
  amount: number;
  type: string;
  description: string;
  date: string;
  relatedPropertyId: number | null;
};

export default function WalletPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isAddCardDialogOpen, setIsAddCardDialogOpen] = useState(false);

  // Fetch wallet balance
  const { data: walletData, isLoading: isLoadingWallet } = useQuery({
    queryKey: ["/api/wallet"],
    queryFn: async () => {
      const res = await fetch("/api/wallet");
      if (!res.ok) throw new Error("Failed to fetch wallet data");
      return res.json();
    },
  });

  // Fetch transactions
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["/api/wallet/transactions"],
    queryFn: async () => {
      const res = await fetch("/api/wallet/transactions");
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return res.json();
    },
  });

  // Deposit mutation
  const depositMutation = useMutation({
    mutationFn: async (amount: string) => {
      return apiRequest("POST", "/api/wallet/deposit", { amount });
    },
    onSuccess: () => {
      toast({
        title: "Deposit Successful",
        description: `${depositAmount} TZS has been added to your wallet`,
      });
      setDepositAmount("");
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/transactions"] });
    },
    onError: (error) => {
      toast({
        title: "Deposit Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Withdraw mutation
  const withdrawMutation = useMutation({
    mutationFn: async (amount: string) => {
      return apiRequest("POST", "/api/wallet/withdraw", { amount });
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal Successful",
        description: `${withdrawAmount} TZS has been withdrawn from your wallet`,
      });
      setWithdrawAmount("");
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/transactions"] });
    },
    onError: (error) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeposit = () => {
    if (!depositAmount || isNaN(parseFloat(depositAmount)) || parseFloat(depositAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to deposit",
        variant: "destructive",
      });
      return;
    }
    depositMutation.mutate(depositAmount);
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || isNaN(parseFloat(withdrawAmount)) || parseFloat(withdrawAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to withdraw",
        variant: "destructive",
      });
      return;
    }
    withdrawMutation.mutate(withdrawAmount);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <BadgePlus className="h-5 w-5 text-green-500" />;
      case "withdrawal":
        return <BadgeMinus className="h-5 w-5 text-red-500" />;
      case "investment":
        return <CreditCard className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <MobileHeader />
      
      <div className="flex-1 flex flex-col md:ml-0 pt-16 md:pt-0">
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-neutral-100">
          <div className="flex flex-col gap-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Wallet</h1>
              <p className="text-muted-foreground">
                Manage your funds and track your transactions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Wallet Balance Card */}
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Balance</CardTitle>
                  <CardDescription>Your current wallet balance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {isLoadingWallet
                      ? "Loading..."
                      : `TZS ${walletData?.balance.toLocaleString()}`}
                  </div>
                </CardContent>
              </Card>

              {/* Transaction Actions Card */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Manage Funds</CardTitle>
                  <CardDescription>Deposit or withdraw funds from your wallet</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="deposit" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="deposit">Deposit</TabsTrigger>
                      <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                    </TabsList>
                    <TabsContent value="deposit">
                      <div className="flex flex-col md:flex-row gap-4">
                        <Input
                          id="depositInput"
                          type="number"
                          placeholder="Amount in TZS"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="md:flex-1"
                        />
                        <Button
                          onClick={handleDeposit}
                          disabled={depositMutation.isPending}
                          className="w-full md:w-auto"
                        >
                          {depositMutation.isPending ? "Processing..." : "Deposit Funds"}
                        </Button>
                      </div>
                    </TabsContent>
                    <TabsContent value="withdraw">
                      <div className="flex flex-col md:flex-row gap-4">
                        <Input
                          id="withdrawInput"
                          type="number"
                          placeholder="Amount in TZS"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          className="md:flex-1"
                        />
                        <Button
                          onClick={handleWithdraw}
                          disabled={withdrawMutation.isPending}
                          className="w-full md:w-auto"
                        >
                          {withdrawMutation.isPending ? "Processing..." : "Withdraw Funds"}
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Rewards Balance Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <p className="text-sm text-muted-foreground">Rewards balance</p>
                      <Star className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <h3 className="text-3xl font-bold">TZS 0</h3>
                  </div>
                  <div>
                    <Star className="h-10 w-10 text-green-300" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transactions List */}
            <div>
              <h2 className="text-xl font-bold mb-4">Transactions</h2>
              <Card>
                <CardContent className="p-0">
                  <div className="grid grid-cols-4 gap-4 p-4 border-b text-sm font-medium text-muted-foreground">
                    <div>Type</div>
                    <div>Status</div>
                    <div>Date</div>
                    <div className="text-right">Amount</div>
                  </div>
                  {isLoadingTransactions ? (
                    <div className="text-center py-8">Loading transactions...</div>
                  ) : transactions?.length > 0 ? (
                    <div>
                      {transactions.map((transaction: WalletTransaction) => (
                        <div key={transaction.id} className="grid grid-cols-4 gap-4 p-4 border-b text-sm">
                          <div className="flex items-center gap-2">
                            {getTransactionIcon(transaction.type)}
                            <span className="capitalize">{transaction.type}</span>
                          </div>
                          <div>Completed</div>
                          <div>
                            {transaction.date
                              ? formatDistanceToNow(new Date(transaction.date), { addSuffix: true })
                              : "Unknown date"}
                          </div>
                          <div className={`text-right font-medium ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                            {transaction.amount > 0 ? "+" : ""}
                            {transaction.amount.toLocaleString()} TZS
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-1">No transactions yet</h3>
                      <p className="text-muted-foreground">
                        Deposit funds to get started with your investments
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Cards Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Payment Cards</h2>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddCardDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <BadgePlus className="h-4 w-4" />
                  <span>Add Card</span>
                </Button>
              </div>
              
              <PaymentCardDisplay onAddCard={() => setIsAddCardDialogOpen(true)} />
            </div>

            {/* Banks Section */}
            <div>
              <h2 className="text-xl font-bold mb-4">Banks</h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Building className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Add a bank account to deposit from anywhere in the world
                    </p>
                  </div>
                  <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                    <span>Add new bank</span>
                    <BadgePlus className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
      
      {/* Add Card Dialog */}
      <Dialog open={isAddCardDialogOpen} onOpenChange={setIsAddCardDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Payment Card</DialogTitle>
            <DialogDescription>
              Add a new payment card to your account for easier deposits
            </DialogDescription>
          </DialogHeader>
          <AddCardForm onClose={() => setIsAddCardDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}