import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector) // Détecte automatiquement la langue du navigateur
  .use(initReactI18next)
  .init({
    resources: {
      fr: {
        translation: {
            "nav": {
                "login": "Connexion",
                "wishlist": "Wishlist",
                "admin": "Admin",
                "logout": "Se déconnecter"
            },
            "wishlist": {
                "loading": "Chargement...",
                "rules_title": "📜 Rappel des règles de Loot",
                "rules_desc": "Important avant de sélectionner vos objets",
                "basic_rule": "💠 Vous pouvez mettre dans la wishlist <1>un seul item pour</1> les Armes, les Armures et les Accessoires.",
                "lock_rule": "🔒 Une fois la wishlist validée, <1>vous ne pourrez plus modifier vos choix</1>.",
                "boss_rules_title": "💎 Règles de Loot (Boss de Guilde)",
                "rule_1_title": "1. Centralisation des Loots",
                "rule_1_desc": "Tous les loots des Boss de Guilde sont envoyés au Coffre de Guilde. La distribution est ensuite gérée par un membre de la Co-Gestion.",
                "rule_2_title": "2. La Wishlist",
                "rule_2_desc": "Vous devez inscrire vos souhaits : Classe, Arme/Armure/Accessoire voulu.",
                "rule_3_title": "3. Attribution et Équité",
                "rule_3_desc": "Priorité aux joueurs <1>présents, anciens et actifs.</1> Une fois un loot obtenu, un délai de 7 jours est requis avant de pouvoir en recevoir un autre.",
                "rule_4_title": "4. Distribution & Vocal Obligatoire",
                "rule_4_desc": "Le vocal Discord est obligatoire lors des distributions de loots.",
                "change_title": "📩 Changement de Wishlist",
                "change_desc": "Si vous avez déjà obtenu <1>un item de votre wishlist</1> et que vous souhaitez <3> modifier votre choix</3>, vous devez impérativement <5> contacter un membre de la Co-Gestion</5> par message privé.",
                "role_title": "Rôle",
                "role_desc": "Obligatoire pour valider",
                "weapons_title": "Armes",
                "armors_title": "Armures",
                "accessories_title": "Accessoires",
                "select_role": "Sélectionner un rôle",
                "select_weapon": "Choisir une arme",
                "select_armor": "Choisir une armure",
                "select_accessory": "Choisir un accessoire",
                "none": "— Aucune —",
                "already_chosen": "Déjà choisi",
                "already_looted": "Tu as déjà loot cet item",
                "looted_tag": "— déjà loot",
                "save": "Sauvegarder",
                "modal_title": "Confirmer la sauvegarde",
                "modal_desc": "Vos items sélectionnés ne pourront plus être modifiés. Êtes-vous sûr ?",
                "cancel": "Annuler",
                "confirm": "Confirmer"
            },
            "login": {
                "title": "Bienvenue sur Akatsushi",
                "description": "Connectez-vous pour gérer votre wishlist",
                "label_pseudo": "Pseudo",
                "placeholder_pseudo": "Votre pseudo",
                "label_password": "Mot de passe",
                "button_login": "Se connecter",
                "error_fields": "Veuillez remplir tous les champs",
                "error_invalid": "Pseudo ou mot de passe incorrect",
                "success": "Connexion réussie !"
            },
            "change_password": {
                "title": "Changer votre mot de passe",
                "subtitle": "Vous devez définir un mot de passe personnel avant de continuer.",
                "placeholder_new": "Nouveau mot de passe",
                "placeholder_confirm": "Confirmer le mot de passe",
                "button_update": "Mettre à jour",
                "loading": "Chargement...",
                "error_required": "Tous les champs sont obligatoires",
                "error_mismatch": "Les nouveaux mots de passe ne correspondent pas",
                "error_length": "Le mot de passe doit faire au moins 6 caractères",
                "error_user": "Utilisateur introuvable",
                "error_update": "Erreur lors de la mise à jour.",
                "success": "Mot de passe mis à jour !"
            }
        }
      },
      en: {
        translation: {
            "nav": {
                "login": "Login",
                "wishlist": "Wishlist",
                "admin": "Admin",
                "logout": "Logout"
            },
            "wishlist": {
                "loading": "Loading...",
                "rules_title": "📜 Loot Rules Reminder",
                "rules_desc": "Important before selecting your items",
                "basic_rule": "💠 You can add <1>only one item for</1> Weapons, Armors, and Accessories to your wishlist.",
                "lock_rule": "🔒 Once validated, <1>you won't be able to modify your choices</1>.",
                "boss_rules_title": "💎 Loot Rules (Guild Bosses)",
                "rule_1_title": "1. Centralized Loot",
                "rule_1_desc": "All Guild Boss loot is sent to the Guild Vault. Distribution is managed by a Co-Management member.",
                "rule_2_title": "2. The Wishlist",
                "rule_2_desc": "You must register your wishes: Class, Weapon/Armor/Accessory wanted.",
                "rule_3_title": "3. Allocation & Fairness",
                "rule_3_desc": "Priority to <1>present, veteran, and active players.</1> Once loot is obtained, a 7-day cooldown is required before receiving another.",
                "rule_4_title": "4. Distribution & Mandatory Voice Chat",
                "rule_4_desc": "Discord voice chat is mandatory during loot distributions.",
                "change_title": "📩 Wishlist Changes",
                "change_desc": "If you have already obtained <1>an item from your wishlist</1> and wish to <3>change your choice</3>, you must <5>contact a Co-Management member</5> via private message.",
                "role_title": "Role",
                "role_desc": "Required to validate",
                "weapons_title": "Weapons",
                "armors_title": "Armors",
                "accessories_title": "Accessories",
                "select_role": "Select a role",
                "select_weapon": "Choose a weapon",
                "select_armor": "Choose an armor",
                "select_accessory": "Choose an accessory",
                "none": "— None —",
                "already_chosen": "Already chosen",
                "already_looted": "You have already looted this item",
                "looted_tag": "— already looted",
                "save": "Save",
                "modal_title": "Confirm Save",
                "modal_desc": "Selected items cannot be modified later. Are you sure?",
                "cancel": "Cancel",
                "confirm": "Confirm"
            },
            "login": {
                "title": "Welcome to Akatsushi",
                "description": "Log in to manage your wishlist",
                "label_pseudo": "Username",
                "placeholder_pseudo": "Your username",
                "label_password": "Password",
                "button_login": "Log In",
                "error_fields": "Please fill in all fields",
                "error_invalid": "Invalid username or password",
                "success": "Login successful!"
            },
            "change_password": {
                "title": "Change your password",
                "subtitle": "You must set a personal password before continuing.",
                "placeholder_new": "New password",
                "placeholder_confirm": "Confirm password",
                "button_update": "Update password",
                "loading": "Loading...",
                "error_required": "All fields are required",
                "error_mismatch": "New passwords do not match",
                "error_length": "Password must be at least 6 characters long",
                "error_user": "User not found",
                "error_update": "Error during update.",
                "success": "Password updated!"
            }
        }
      }
    },
    fallbackLng: "fr", // Si la langue n'est pas trouvée, on met FR par défaut
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;