import { Coins, Film, Home, MenuIcon, Theater } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import Link from "next/link";

export default function MainMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="right-10 top-5 bg-card w-13 h-13 rounded-md"
        >
          <MenuIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-50" align="end" forceMount>
        <p className="font-medium ml-2 mt-3">Menu</p>

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer flex items-center">
            <Home className="mr-2 h-4 w-4" />
            <span className="text-left">Home</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/" className="cursor-pointer flex items-center">
            <Film className="mr-2 h-4 w-4" />
            <span className="text-left">Cinema Movies</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/favorites" className="cursor-pointer flex items-center">
            <Theater className="mr-2 h-4 w-4" />
            <span className="text-left">Theater Plays</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/favorites" className="cursor-pointer flex items-center">
            <Coins className="mr-2 h-4 w-4" />
            <span className="text-left">Become a sponsor</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
