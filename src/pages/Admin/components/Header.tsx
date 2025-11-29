import { Button } from "@/components/ui/button";
import { Unlock } from "lucide-react";

const Header = ({ onUnlockAll }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-gold bg-clip-text text-transparent">
          Administration
        </h1>
        <p className="text-muted-foreground mt-2">Gérez les wishlists des membres de la guilde</p>
      </div>

      <Button
        onClick={onUnlockAll}
        className="border-primary/20 hover:border-primary/40 text-white shadow-md flex items-center gap-2 px-4 py-2 rounded"
      >
        <Unlock className="h-4 w-4" /> Tout vider et débloquer
      </Button>
    </div>
  );
};

export default Header;
