import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type PaymentCard } from "@shared/schema";

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Label } from "@/components/ui/label";

// Card deposit form schema
const cardDepositSchema = z.object({
  cardId: z.string().min(1, "Please select a card"),
  amount: z
    .string()
    .min(1, "Please enter an amount")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be a positive number",
    }),
  cvv: z
    .string()
    .min(3, "CVV must be at least 3 digits")
    .max(4, "CVV cannot exceed 4 digits")
    .regex(/^[0-9]+$/, "CVV must contain only digits"),
});

type CardDepositFormValues = z.infer<typeof cardDepositSchema>;

interface CardDepositProps {
  onClose: () => void;
  onAddCard: () => void;
}

export function CardDeposit({ onClose, onAddCard }: CardDepositProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch user's payment cards
  const { 
    data: cards, 
    isLoading: isLoadingCards, 
    isError: isCardsError,
    error: cardsError 
  } = useQuery<PaymentCard[]>({
    queryKey: ["/api/cards"],
    queryFn: async () => {
      const res = await fetch("/api/cards");
      if (!res.ok) throw new Error("Failed to fetch payment cards");
      return res.json();
    },
  });

  // Form initialization
  const form = useForm<CardDepositFormValues>({
    resolver: zodResolver(cardDepositSchema),
    defaultValues: {
      cardId: "",
      amount: "",
      cvv: "",
    },
  });

  // Get card type styling
  const getCardTypeStyle = (cardType: string) => {
    switch (cardType.toLowerCase()) {
      case 'visa':
        return { bgColor: 'bg-blue-50', textColor: 'text-blue-700', name: 'Visa' };
      case 'mastercard':
        return { bgColor: 'bg-red-50', textColor: 'text-red-700', name: 'Mastercard' };
      case 'amex':
        return { bgColor: 'bg-green-50', textColor: 'text-green-700', name: 'American Express' };
      case 'discover':
        return { bgColor: 'bg-orange-50', textColor: 'text-orange-700', name: 'Discover' };
      default:
        return { bgColor: 'bg-gray-50', textColor: 'text-gray-700', name: cardType };
    }
  };

  // Deposit mutation
  const depositMutation = useMutation({
    mutationFn: async (data: CardDepositFormValues) => {
      const depositData = {
        amount: data.amount,
        method: "card",
        cardId: data.cardId,
        cvv: data.cvv,
      };
      return apiRequest("POST", "/api/wallet/deposit", depositData);
    },
    onSuccess: () => {
      toast({
        title: "Deposit Successful",
        description: "Your funds have been added to your wallet",
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
  const onSubmit = (data: CardDepositFormValues) => {
    setIsSubmitting(true);
    depositMutation.mutate(data);
  };

  // Loading state
  if (isLoadingCards) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Error state
  if (isCardsError) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="h-10 w-10 text-red-500 mb-4" />
        <p className="text-red-500 font-medium">Error loading payment cards</p>
        <p className="text-sm text-muted-foreground mb-4">{cardsError?.message}</p>
        <Button onClick={onClose}>Go Back</Button>
      </div>
    );
  }

  // No cards state
  if (!cards || cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-1">No payment cards found</h3>
        <p className="text-muted-foreground mb-4">
          Add a payment card to make deposits
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onAddCard}>Add a Card</Button>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="cardId"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Select Card</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="space-y-3"
                >
                  {cards.map((card) => (
                    <div key={card.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={card.id.toString()} id={`card-${card.id}`} />
                      <Label htmlFor={`card-${card.id}`} className="flex-1 cursor-pointer">
                        <div className="flex items-center p-2 rounded-md border hover:bg-muted">
                          <div className={`p-2 mr-3 rounded ${getCardTypeStyle(card.cardType).bgColor}`}>
                            <CreditCard className={`h-5 w-5 ${getCardTypeStyle(card.cardType).textColor}`} />
                          </div>
                          <div>
                            <p className="font-medium">{card.cardholderName}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-muted-foreground">{card.cardNumber}</p>
                              {card.isDefault && (
                                <span className="flex items-center text-xs text-green-600 font-medium">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Default
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem className="col-span-1">
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

          <FormField
            control={form.control}
            name="cvv"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>CVV</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="123"
                    {...field}
                    maxLength={4}
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
            {isSubmitting ? "Processing..." : "Deposit Funds"}
          </Button>
        </div>
      </form>
    </Form>
  );
}