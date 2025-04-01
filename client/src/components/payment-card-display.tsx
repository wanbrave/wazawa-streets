import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PaymentCard } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, 
  Trash2, 
  Star, 
  Check, 
  AlertCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PaymentCardDisplayProps {
  onAddCard: () => void;
}

export function PaymentCardDisplay({ onAddCard }: PaymentCardDisplayProps) {
  const { toast } = useToast();
  const [deleteCardId, setDeleteCardId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Fetch user's payment cards
  const { 
    data: cards, 
    isLoading, 
    isError,
    error 
  } = useQuery<PaymentCard[]>({
    queryKey: ["/api/cards"],
    queryFn: async () => {
      const res = await fetch("/api/cards");
      if (!res.ok) throw new Error("Failed to fetch payment cards");
      return res.json();
    },
  });
  
  // Delete card mutation
  const deleteCardMutation = useMutation({
    mutationFn: async (cardId: number) => {
      return apiRequest("DELETE", `/api/cards/${cardId}`);
    },
    onSuccess: () => {
      toast({
        title: "Card Deleted",
        description: "Your payment card has been removed",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cards"] });
      setDeleteCardId(null);
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to Delete Card",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Set default card mutation
  const setDefaultCardMutation = useMutation({
    mutationFn: async (cardId: number) => {
      return apiRequest("POST", `/api/cards/${cardId}/default`);
    },
    onSuccess: () => {
      toast({
        title: "Default Card Updated",
        description: "Your default payment card has been updated",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cards"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Update Default Card",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle delete confirmation
  const handleDeleteCard = (cardId: number) => {
    setDeleteCardId(cardId);
    setIsDeleteDialogOpen(true);
  };
  
  // Confirm delete
  const confirmDeleteCard = () => {
    if (deleteCardId !== null) {
      deleteCardMutation.mutate(deleteCardId);
    }
  };
  
  // Set card as default
  const setDefaultCard = (cardId: number) => {
    setDefaultCardMutation.mutate(cardId);
  };
  
  // Get card type icon/style
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
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
        <p className="text-red-500 font-medium">Error loading payment cards</p>
        <p className="text-sm text-muted-foreground">{error?.message}</p>
        <Button className="mt-4" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/cards"] })}>
          Try Again
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {cards && cards.length > 0 ? (
        <div className="space-y-3">
          {cards.map((card) => (
            <Card key={card.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded ${getCardTypeStyle(card.cardType).bgColor}`}>
                      <CreditCard className={`h-5 w-5 ${getCardTypeStyle(card.cardType).textColor}`} />
                    </div>
                    <div>
                      <p className="font-medium">{card.cardholderName}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">{card.cardNumber}</p>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100">
                          {getCardTypeStyle(card.cardType).name}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100">
                          Expires {card.expiryDate}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {card.isDefault ? (
                      <div className="flex items-center text-green-600 text-sm font-medium">
                        <Check className="h-4 w-4 mr-1" />
                        Default
                      </div>
                    ) : (
                      <Button
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setDefaultCard(card.id)}
                        disabled={setDefaultCardMutation.isPending}
                      >
                        <Star className="h-4 w-4 mr-1" />
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteCard(card.id)}
                      disabled={deleteCardMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center border rounded-lg bg-gray-50">
          <CreditCard className="h-12 w-12 text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium mb-1">No payment cards</h3>
          <p className="text-muted-foreground mb-4">
            Add a payment card to make deposits easier
          </p>
          <Button onClick={onAddCard}>
            Add a Card
          </Button>
        </div>
      )}
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the payment card from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={confirmDeleteCard}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}