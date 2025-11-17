"use client"; // Mark this file as client-side

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { CreditCard } from "lucide-react"; // Import Lucide CreditCard Icon

const ThankYouPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("transactionId");
  const amount = searchParams.get("amount");

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-8">
      <Card className="max-w-xl w-full shadow-xl bg-white rounded-xl border border-gray-200 p-8">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold text-gray-800">
            Thank You for Your Support!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {/* Amount Styling */}
          <div className="text-6xl font-bold text-gray-900 p-10">
            <span className="text-4xl font-normal text-gray-600">$</span>
            {amount}
          </div>
        </CardContent>

        <CardFooter className="flex justify-center gap-6 mt-6">
          <Button
            variant="default"
            size="lg"
            onClick={() => router.push("/")}
            className="px-6 py-3 text-lg w-full"
          >
            Home
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push("/sponsorship")}
            className="px-6 py-3 text-lg text-primary border-primary hover:bg-primary/10 w-full"
          >
            New Donation
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ThankYouPage;
