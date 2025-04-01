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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Card form schema with validation
const cardSchema = z.object({
  cardholderName: z
    .string()
    .min(3, "Cardholder name must be at least 3 characters")
    .max(50, "Cardholder name cannot exceed 50 characters"),
  cardNumber: z
    .string()
    .min(16, "Card number must be at least 16 digits")
    .max(19, "Card number cannot exceed 19 digits")
    .regex(/^[0-9]+$/, "Card number must contain only digits"),
  expiryDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Expiry date must be in MM/YY format"),
  cvv: z
    .string()
    .min(3, "CVV must be at least 3 digits")
    .max(4, "CVV cannot exceed 4 digits")
    .regex(/^[0-9]+$/, "CVV must contain only digits"),
  cardType: z.string().min(1, "Please select a card type"),
});

type CardFormValues = z.infer<typeof cardSchema>;

interface AddCardFormProps {
  onClose: () => void;
}

export function AddCardForm({ onClose }: AddCardFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize the form
  const form = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      cardholderName: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardType: "",
    },
  });

  // Add card mutation
  const addCardMutation = useMutation({
    mutationFn: async (data: CardFormValues) => {
      return apiRequest("POST", "/api/cards", data);
    },
    onSuccess: () => {
      toast({
        title: "Card Added",
        description: "Your payment card has been added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cards"] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to Add Card",
        description: error.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  // Handle form submission
  const onSubmit = (data: CardFormValues) => {
    setIsSubmitting(true);
    
    // Format the card number display (hide middle digits)
    const formattedCardNumber = data.cardNumber.replace(/^(\d{4})(\d+)(\d{4})$/, "$1********$3");
    
    // Submit the form with the formatted card number for display
    const formData = {
      ...data,
      cardNumber: formattedCardNumber,
    };
    
    addCardMutation.mutate(formData);
  };

  // Format credit card number with spaces
  const formatCardNumber = (value: string) => {
    const valueWithoutSpaces = value.replace(/\s/g, "");
    if (valueWithoutSpaces.length <= 16) {
      return valueWithoutSpaces.replace(/(.{4})/g, "$1 ").trim();
    }
    return valueWithoutSpaces;
  };

  // Format expiry date with slash
  const formatExpiryDate = (value: string) => {
    const valueWithoutSlash = value.replace(/\//g, "");
    if (valueWithoutSlash.length >= 2) {
      return `${valueWithoutSlash.substring(0, 2)}/${valueWithoutSlash.substring(2, 4)}`;
    }
    return valueWithoutSlash;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="cardholderName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cardholder Name</FormLabel>
              <FormControl>
                <Input placeholder="Name on card" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cardNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Card Number</FormLabel>
              <FormControl>
                <Input 
                  placeholder="1234 5678 9012 3456" 
                  {...field} 
                  onChange={(e) => {
                    const formatted = formatCardNumber(e.target.value);
                    e.target.value = formatted;
                    field.onChange(formatted.replace(/\s/g, ""));
                  }}
                  maxLength={19}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="expiryDate"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Expiry Date</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="MM/YY" 
                    {...field} 
                    onChange={(e) => {
                      const formatted = formatExpiryDate(e.target.value);
                      e.target.value = formatted;
                      field.onChange(formatted);
                    }}
                    maxLength={5}
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
                    placeholder="123" 
                    type="password" 
                    {...field} 
                    maxLength={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cardType"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Card Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="visa">Visa</SelectItem>
                    <SelectItem value="mastercard">Mastercard</SelectItem>
                    <SelectItem value="amex">American Express</SelectItem>
                    <SelectItem value="discover">Discover</SelectItem>
                  </SelectContent>
                </Select>
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
            {isSubmitting ? "Adding..." : "Add Card"}
          </Button>
        </div>
      </form>
    </Form>
  );
}