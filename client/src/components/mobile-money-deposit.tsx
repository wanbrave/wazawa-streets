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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Smartphone, CreditCard } from "lucide-react";

// Mobile money form schema
const mobileMoneySchema = z.object({
  provider: z.string().min(1, "Please select a mobile money provider"),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(12, "Phone number cannot exceed 12 digits")
    .regex(/^[0-9]+$/, "Phone number must contain only digits"),
  amount: z
    .string()
    .min(1, "Please enter an amount")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be a positive number",
    }),
});

type MobileMoneyFormValues = z.infer<typeof mobileMoneySchema>;

interface MobileMoneyDepositProps {
  onClose: () => void;
}

export function MobileMoneyDeposit({ onClose }: MobileMoneyDepositProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form initialization
  const form = useForm<MobileMoneyFormValues>({
    resolver: zodResolver(mobileMoneySchema),
    defaultValues: {
      provider: "",
      phoneNumber: "",
      amount: "",
    },
  });

  // Get provider logo and color
  const getProviderStyle = (provider: string) => {
    switch (provider.toLowerCase()) {
      case "m-pesa":
        return { icon: <Smartphone className="h-5 w-5" />, color: "text-green-600" };
      case "airtel-money":
        return { icon: <Smartphone className="h-5 w-5" />, color: "text-red-600" };
      case "tigo-pesa":
        return { icon: <Smartphone className="h-5 w-5" />, color: "text-blue-600" };
      case "halotel-pesa":
        return { icon: <Smartphone className="h-5 w-5" />, color: "text-purple-600" };
      default:
        return { icon: <Phone className="h-5 w-5" />, color: "text-gray-600" };
    }
  };

  // Deposit mutation
  const depositMutation = useMutation({
    mutationFn: async (data: MobileMoneyFormValues) => {
      const depositData = {
        amount: data.amount,
        method: "mobile-money",
        provider: data.provider,
        phoneNumber: data.phoneNumber,
      };
      return apiRequest("POST", "/api/wallet/deposit", depositData);
    },
    onSuccess: () => {
      toast({
        title: "Deposit Initiated",
        description: "Please confirm the transaction on your mobile device",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/transactions"] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Deposit Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  // Form submission handler
  const onSubmit = (data: MobileMoneyFormValues) => {
    setIsSubmitting(true);
    depositMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="provider"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mobile Money Provider</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="m-pesa">M-Pesa</SelectItem>
                  <SelectItem value="airtel-money">Airtel Money</SelectItem>
                  <SelectItem value="tigo-pesa">Tigo Pesa</SelectItem>
                  <SelectItem value="halotel-pesa">Halotel Pesa</SelectItem>
                  <SelectItem value="ttcl-pesa">TTCL Pesa</SelectItem>
                  <SelectItem value="mixby-yas">Mixby Yas</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input
                  placeholder="0712345678"
                  {...field}
                  maxLength={12}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
              <FormMessage />
            </FormItem>
          )}
        />

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
            {isSubmitting ? "Processing..." : "Continue"}
          </Button>
        </div>
      </form>
    </Form>
  );
}