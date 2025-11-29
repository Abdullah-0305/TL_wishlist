// /Admin/components/BossCounts.tsx
import React from "react";

interface BossCountsProps {
  bossCounts: {
    armes: [string, number][];
    armures: [string, number][];
    accessoires: [string, number][];
  };
  selectedBoss: string | null;
  onBossClick: (boss: string) => void;
  onReset: () => void;
}

const BossCounts: React.FC<BossCountsProps> = ({
  bossCounts,
  selectedBoss,
  onBossClick,
  onReset
}) => {
  const sections = [
    { label: "Armes", data: bossCounts.armes },
    { label: "Armures", data: bossCounts.armures },
    { label: "Accessoires", data: bossCounts.accessoires },
  ];

  return (
    <div className="space-y-4 mb-6">

      {/* Bouton reset */}
      <button
        onClick={onReset}
        className="
          px-3 py-2 rounded bg-red-600 text-white text-sm 
          hover:bg-red-700 transition
        "
      >
        Réinitialiser le filtre Boss
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {sections.map((section) => (
          <div
            key={section.label}
            className="p-4 bg-card border border-primary/20 rounded-xl shadow-sm"
          >
            <h4 className="font-semibold mb-3">{section.label}</h4>

            {section.data.length === 0 ? (
              <div className="text-sm text-muted-foreground">Aucun boss</div>
            ) : (
              <div className="space-y-2">
                {section.data.map(([boss, count]) => {
                  const active = selectedBoss === boss;

                  return (
                    <button
                      key={boss}
                      onClick={() => onBossClick(boss)}
                      className={`
                        w-full flex justify-between items-center text-sm px-2 py-1 rounded 
                        transition cursor-pointer
                        ${active
                          ? "bg-primary/30 text-white"
                          : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                        }
                      `}
                    >
                      <span>{boss}</span>
                      <span
                        className={`
                          px-2 py-1 rounded-full text-xs font-medium 
                          ${active ? "bg-primary/30" : "bg-primary/30 text-primary-foreground"}
                        `}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BossCounts;
