const BossCounts = ({ bossCounts }) => {
  const sections = [
    { label: "Armes", data: bossCounts.armes },
    { label: "Armures", data: bossCounts.armures },
    { label: "Accessoires", data: bossCounts.accessoires },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
              {section.data.map(([boss, count]) => (
                <div
                  key={boss}
                  className="flex justify-between items-center text-sm text-muted-foreground"
                >
                  <span>{boss}</span>
                  <span className="px-2 py-1 bg-primary/30 rounded-full text-xs font-medium text-primary-foreground">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default BossCounts;
