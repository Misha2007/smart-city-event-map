"use client";
import PaypalCardForm from "../../components/PaypalDonationButton";

import AuthButton from "@/components/auth-button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-7xl m-auto px-4 py-10">
      <div className="flex justify-between items-center mt-2 mb-10">
        <h1 className="text-2xl font-bold">Movies</h1>
        <div className="flex items-center">
          <Link
            href="/"
            className="cursor-pointer flex items-center pr-4 border-r-2"
          >
            Home
          </Link>
          <Link
            href="/plays"
            className="cursor-pointer flex items-center pr-4 pl-4 border-r-2"
          >
            Theater plays
          </Link>
          <Link
            href="/sponsorship"
            className="cursor-pointer flex items-center pl-4 pr-4 border-r-2"
          >
            Sponsorship
          </Link>
          <div className="pl-4 flex item-center">
            <AuthButton />
          </div>
        </div>
      </div>
      <PaypalCardForm />
    </div>
  );
}
