import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, AlertCircle } from "lucide-react";

// Bank withdrawal form schema
const bankWithdrawalSchema = z.object({
  bankName: z.string().min(1, "Please select a bank"),
  accountNumber: z
    .string()
    .min(10, "Account number must be at least 10 digits")
    .max(20, "Account number cannot exceed 20 digits")
    .regex(/^[0-9]+$/, "Account number must contain only digits"),
  accountName: z
    .string()
    .min(3, "Account name must be at least 3 characters")
    .max(100, "Account name cannot exceed 100 characters"),
  amount: z
    .string()
    .min(1, "Please enter an amount")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be a positive number",
    }),
  branchName: z.string().optional(),
  swiftCode: z.string().optional(),
});

type BankWithdrawalFormValues = z.infer<typeof bankWithdrawalSchema>;

interface BankWithdrawalProps {
  onClose: () => void;
  walletBalance: number;
}

export function BankWithdrawal({ onClose, walletBalance }: BankWithdrawalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form initialization
  const form = useForm<BankWithdrawalFormValues>({
    resolver: zodResolver(bankWithdrawalSchema),
    defaultValues: {
      bankName: "",
      accountNumber: "",
      accountName: "",
      amount: "",
      branchName: "",
      swiftCode: "",
    },
  });

  // Tanzanian banks list
  const tanzanianBanks = [
    "CRDB Bank",
    "NMB Bank",
    "NBC Bank",
    "Stanbic Bank",
    "DTB Bank",
    "Exim Bank",
    "Absa Bank",
    "Standard Chartered",
    "Equity Bank",
    "TPB Bank",
    "BOA Bank",
    "Access Bank",
    "I&M Bank",
    "Azania Bank",
    "Akiba Commercial Bank",
    "TIB Development Bank",
  ];

  // Withdrawal mutation
  const withdrawalMutation = useMutation({
    mutationFn: async (data: BankWithdrawalFormValues) => {
      const withdrawalData = {
        amount: data.amount,
        method: "bank",
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        accountName: data.accountName,
        branchName: data.branchName || null,
        swiftCode: data.swiftCode || null,
      };
      return apiRequest("POST", "/api/wallet/withdraw", withdrawalData);
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal Initiated",
        description: "Your withdrawal request has been submitted and is being processed",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/transactions"] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  // Form submission handler
  const onSubmit = (data: BankWithdrawalFormValues) => {
    const amount = parseFloat(data.amount);
    if (amount > walletBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough funds to withdraw this amount",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    withdrawalMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex items-center p-3 bg-amber-50 rounded border border-amber-200 mb-4">
          <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
          <p className="text-sm text-amber-700">
            Withdrawal requests are processed within 1-3 business days. A processing fee of 1% applies.
          </p>
        </div>
        
        <FormField
          control={form.control}
          name="bankName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Name</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tanzanianBanks.map((bank) => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="accountNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Number</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="12345678901" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="accountName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Holder Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="John Doe" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (TZS)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="10000"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Available balance: TZS {walletBalance.toLocaleString()}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="branchName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Branch Name (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Main Branch" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="swiftCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SWIFT Code (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="CRDBTZTX" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Withdraw Funds"}
          </Button>
        </div>
      </form>
    </Form>
  );
}