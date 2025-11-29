import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

const FilterBar = ({
  selectedFilter,
  setSelectedFilter,
  armes,
  armures,
  accessoires
}) => {
  return (
    <div className="w-full p-4 bg-card border border-primary/20 rounded-xl shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <span className="font-medium text-sm sm:hidden">Filtrer</span>
        </div>

        <select
          className="flex-grow bg-background border border-primary/30 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
        >
          <option value="">— Filtrer par item —</option>

          <optgroup label="Armes">
            {armes.map((a) => (
              <option key={a.id} value={a.name}>{a.name}</option>
            ))}
          </optgroup>

          <optgroup label="Armures">
            {armures.map((a) => (
              <option key={a.id} value={a.name}>{a.name}</option>
            ))}
          </optgroup>

          <optgroup label="Accessoires">
            {accessoires.map((a) => (
              <option key={a.id} value={a.name}>{a.name}</option>
            ))}
          </optgroup>
        </select>

        {selectedFilter && (
          <Button variant="outline" onClick={() => setSelectedFilter("")} className="sm:ml-auto">
            Réinitialiser
          </Button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
