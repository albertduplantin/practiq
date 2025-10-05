'use client';

import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>404 - Page Non Trouvée</h1>
      <p>Désolé, la page que vous cherchez n'existe pas.</p>
      <Link href="/">Retour à l'accueil</Link>
    </div>
  );
}
