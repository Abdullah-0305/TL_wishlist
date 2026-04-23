# ⚔️ Akatsushi - Throne & Liberty Wishlist System

> **Plateforme stratégique de gestion de loots pour les guildes de Throne & Liberty.**  
> Centralisez les **wishlists** de vos membres et optimisez la distribution des récompenses grâce à un **Command Center ultra-rapide** signé **Akatsushi**.

---

## ✨ Design & Expérience — *Néon Royal*

L’identité visuelle de l’application repose sur une charte graphique propriétaire :  
**Néon Royal** — un mélange d’**Or** et de **Fuchsia** sur fond d’**Obsidienne**.

### Interface et UX
- **Glassmorphism** : Surfaces semi-transparentes, flou d’arrière-plan (*backdrop-blur*) pour un effet futuriste.  
- **Mobile-First** : HUD tactique, grilles adaptatives, gestion fluide en raid depuis un smartphone.  
- **Micro-interactions** : Animations de scan, néons dynamiques, transitions fluides pour une immersion totale.

---

## 🚀 Fonctionnalités Clés

### 👤 Espace Joueur
- **Slots d’Équipement** : Sélection unique pour Armes, Armures et Accessoires.  
- **Protocole de Verrouillage** : Wishlist verrouillée automatiquement après validation pour garantir l’intégrité du loot queue.  
- **Suivi de Loot** : Marquage des pièces acquises en *Gilded* (doré) et verrouillage automatique des slots correspondants.

### 🛡️ Sécurité & Authentification — *Double-Auth*
- **Discord Gateway** : Accès restreint aux membres ayant un rôle spécifique sur le serveur de guilde.  
- **Anti-Resurrection Logic** : Un utilisateur supprimé est expulsé en temps réel sans persistance du cache.  
- **Intention de Connexion** : Protection avancée contre les comptes fantômes via validation stricte de session.

### 👑 Console d’Administration
- **Radar de Loot** : Filtrage dynamique par objet, boss ou rôle pour repérer les joueurs prioritaires.  
- **Gestion de Présence** : Outil de pointage rapide (Reset / All Present) pour les événements.  
- **Contrôle Total** : Officiers autorisés à débloquer des slots ou réinitialiser des acquisitions après arbitrage.

---

## 🛠️ Stack Technique

| Composant | Technologie |
|------------|--------------|
| Frontend | React 18 / Vite |
| Styling | Tailwind CSS / shadcn/ui (composants personnalisés) |
| Base de Données & Auth | Supabase (PostgreSQL) + Row Level Security (RLS) |
| Internationalisation | i18next (FR/EN avec détection automatique) |
| Icônes | Lucide React |

---

## ⚙️ Configuration Environnementale

Avant le lancement, configurez les variables suivantes dans votre environnement :

```bash
VITE_SUPABASE_URL=<votre_instance_supabase_url>
VITE_SUPABASE_ANON_KEY=<votre_cle_anon_publique>
MAINTENANCE_MODE=<false ou true>
DISCORD_GUILD_ID=<id_du_serveur_discord>
REQUIRED_ROLE_ID=<id_du_role_autorise>
```

> 💡 Pour des raisons de sécurité, ces clés ne doivent **jamais** être exposées publiquement.

---

### 🧩 Crédits

Développé pour la guilde **Akatsushi** — *Throne & Liberty EU*  
Design original : **Néon Royal Framework**  
