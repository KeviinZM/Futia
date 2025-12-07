import pandas as pd
import json
import os

def convertir_database():
    fichier_entree = 'FC26_20250921.csv'
    fichier_sortie = 'database_complete_fc26.json'

    print(f"--- Lecture de {fichier_entree} ---")

    if not os.path.exists(fichier_entree):
        print(f"ERREUR : Le fichier {fichier_entree} est introuvable.")
        return

    # 1. Chargement
    # low_memory=False évite un avertissement sur les gros fichiers
    df = pd.read_csv(fichier_entree, low_memory=False)
    
    # Remplacer les valeurs vides par None pour le JSON
    df = df.where(pd.notnull(df), None)

    print(f"Chargement réussi. {len(df)} joueurs trouvés.")

    # 2. Sélection et nettoyage des colonnes
    # On crée une liste propre de dictionnaires
    liste_joueurs = []

    for index, row in df.iterrows():
        joueur = {
            "id": str(row['player_id']),
            "nom": row['short_name'],
            "nom_complet": row['long_name'],
            "note": int(row['overall']),
            "club": row['club_name'],
            "ligue": row['league_name'],
            "pays": row['nationality_name'],
            "positions": row['player_positions'],
            "image": row['player_face_url'],
            "stats": {
                "vitesse": int(row['pace']) if row['pace'] is not None else 0,
                "tir": int(row['shooting']) if row['shooting'] is not None else 0,
                "passe": int(row['passing']) if row['passing'] is not None else 0,
                "dribble": int(row['dribbling']) if row['dribbling'] is not None else 0,
                "defense": int(row['defending']) if row['defending'] is not None else 0,
                "physique": int(row['physic']) if row['physic'] is not None else 0,
                "gestes_techniques": int(row['skill_moves']) if row['skill_moves'] is not None else 0,
                "mauvais_pied": int(row['weak_foot']) if row['weak_foot'] is not None else 0
            }
        }
        liste_joueurs.append(joueur)

    # 3. Export
    print("Écriture du fichier JSON...")
    with open(fichier_sortie, 'w', encoding='utf-8') as f:
        json.dump(liste_joueurs, f, indent=4, ensure_ascii=False)

    print(f"--- TERMINÉ ! ---")
    print(f"Fichier créé : {fichier_sortie}")

if __name__ == "__main__":
    convertir_database()