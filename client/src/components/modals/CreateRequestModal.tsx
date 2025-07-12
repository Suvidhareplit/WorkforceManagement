import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import HiringRequestForm from "../forms/HiringRequestForm";

interface CreateRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateRequestModal({ open, onOpenChange }: CreateRequestModalProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const createRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/hiring", {
        cityId: parseInt(data.cityId),
        clusterId: parseInt(data.clusterId),
        roleId: parseInt(data.roleId),
        numberOfPositions: parseInt(data.numberOfPositions),
        priority: data.priority,
        requestType: data.requestType,
        notes: data.notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hiring"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      toast({
        title: "Success",
        description: "Hiring request(s) created successfully",
      });
      onOpenChange(false);
      setLocation("/hiring/requests");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create hiring request",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: any) => {
    createRequestMutation.mutate(data);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Hiring Request</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <HiringRequestForm
            onSubmit={handleSubmit}
            isLoading={createRequestMutation.isPending}
            onCancel={handleCancel}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
