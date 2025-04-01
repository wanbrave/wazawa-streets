import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { BadgePlus, BadgeMinus, Clock, CreditCard } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { MobileHeader } from "@/components/mobile-header";

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
  const queryClient = new QueryClient();

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

            {/* Transactions List */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Recent activity in your wallet</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTransactions ? (
                  <div className="text-center py-4">Loading transactions...</div>
                ) : transactions?.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.map((transaction: WalletTransaction) => (
                      <div key={transaction.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getTransactionIcon(transaction.type)}
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {transaction.date
                                ? formatDistanceToNow(new Date(transaction.date), { addSuffix: true })
                                : "Unknown date"}
                            </p>
                          </div>
                        </div>
                        <div className={`font-medium ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                          {transaction.amount > 0 ? "+" : ""}
                          {transaction.amount.toLocaleString()} TZS
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No transactions yet. Deposit funds to get started.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}