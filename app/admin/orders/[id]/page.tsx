import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, CreditCard, MapPin, User, Mail } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Page Détail Commande Admin
 *
 * Affiche toutes les informations d'une commande :
 * - Informations client (nom, email)
 * - Statut et paiement
 * - Adresse de livraison
 * - Liste des produits commandés
 * - Timeline et historique
 *
 * Style Byredo : Cartes épurées, typographie uppercase, bordures fines
 */

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Récupérer la commande
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (orderError || !order) {
    console.error("❌ Erreur récupération commande:", orderError?.message);
    notFound();
  }

  // Enrichir avec profil utilisateur si user_id existe
  let profile = null;
  if (order.user_id) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("id", order.user_id)
      .single();

    profile = profileData;
  }

  // Déterminer les infos client à afficher
  // Priorité : profil > customer_name/customer_email > shipping_address
  const customerName =
    profile?.full_name ||
    order.customer_name ||
    (order.shipping_address?.first_name
      ? `${order.shipping_address.first_name} ${order.shipping_address.last_name || ""}`.trim()
      : "Invité");

  const customerEmail =
    profile?.email ||
    order.customer_email ||
    order.shipping_address?.email ||
    "Email non fourni";

  // Badge de statut
  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-orange-50 text-orange-700 border-orange-200",
      paid: "bg-green-50 text-green-700 border-green-200",
      processing: "bg-blue-50 text-blue-700 border-blue-200",
      completed: "bg-green-50 text-green-700 border-green-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
    };

    const labels = {
      pending: "En attente",
      paid: "Payé",
      processing: "En cours",
      completed: "Livré",
      cancelled: "Annulé",
    };

    return (
      <span
        className={`inline-block px-3 py-1 text-[10px] uppercase tracking-wider font-bold border ${
          styles[status as keyof typeof styles] || styles.pending
        }`}
      >
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  // Formater le montant
  const formattedAmount = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(order.amount / 100);

  return (
    <div className="p-4 md:p-8">
      {/* Header avec retour */}
      <div className="mb-8">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-sm uppercase tracking-wider font-medium hover:underline mb-4"
        >
          <ArrowLeft size={16} strokeWidth={2} />
          Retour aux commandes
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl uppercase tracking-widest font-bold mb-2">
              Commande #{order.id.slice(0, 8)}
            </h1>
            <p className="text-sm text-gray-500 uppercase tracking-wider">
              Créée il y a{" "}
              {formatDistanceToNow(new Date(order.created_at), { locale: fr })}
            </p>
          </div>

          <div>{getStatusBadge(order.status)}</div>
        </div>
      </div>

      {/* Grille principale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          {/* Carte Produits Commandés */}
          <div className="bg-white border border-black">
            <div className="px-6 py-4 border-b border-black flex items-center gap-2">
              <Package size={16} strokeWidth={2} />
              <h2 className="text-xs uppercase tracking-[0.2em] font-bold">
                Produits Commandés
              </h2>
            </div>

            <div className="divide-y divide-gray-200">
              {order.cart_items && order.cart_items.length > 0 ? (
                order.cart_items.map((item: any, index: number) => (
                  <div key={index} className="px-6 py-4 flex items-start gap-4">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-16 h-16 object-cover border border-gray-200"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-bold mb-1">{item.name}</p>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">
                        {item.brand || "N/A"}
                      </p>
                      <p className="text-xs text-gray-600 mt-2">
                        Quantité : {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        }).format(item.price / 100)}
                      </p>
                      <p className="text-xs text-gray-500">par unité</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-sm text-gray-500">
                  Aucun produit dans cette commande
                </div>
              )}
            </div>

            {/* Total */}
            <div className="px-6 py-4 border-t border-black bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm uppercase tracking-wider font-bold">
                  Total
                </p>
                <p className="text-xl font-bold">{formattedAmount}</p>
              </div>
            </div>
          </div>

          {/* Carte Adresse de Livraison */}
          {order.shipping_address && (
            <div className="bg-white border border-black">
              <div className="px-6 py-4 border-b border-black flex items-center gap-2">
                <MapPin size={16} strokeWidth={2} />
                <h2 className="text-xs uppercase tracking-[0.2em] font-bold">
                  Adresse de Livraison
                </h2>
              </div>

              <div className="px-6 py-4">
                <div className="space-y-1 text-sm">
                  <p className="font-medium">
                    {order.shipping_address.first_name}{" "}
                    {order.shipping_address.last_name}
                  </p>
                  <p>{order.shipping_address.address}</p>
                  <p>
                    {order.shipping_address.postal_code}{" "}
                    {order.shipping_address.city}
                  </p>
                  <p className="uppercase">{order.shipping_address.country}</p>
                  {order.shipping_address.phone && (
                    <p className="text-gray-600 mt-2">
                      Tél: {order.shipping_address.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Colonne droite - Informations client et paiement */}
        <div className="lg:col-span-1 space-y-6">
          {/* Carte Client */}
          <div className="bg-white border border-black">
            <div className="px-6 py-4 border-b border-black flex items-center gap-2">
              <User size={16} strokeWidth={2} />
              <h2 className="text-xs uppercase tracking-[0.2em] font-bold">
                Client
              </h2>
            </div>

            <div className="px-6 py-4 space-y-3">
              <div className="flex items-start gap-2">
                <User size={14} className="text-gray-400 mt-0.5" strokeWidth={2} />
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                    Nom
                  </p>
                  <p className="text-sm font-medium">{customerName}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Mail size={14} className="text-gray-400 mt-0.5" strokeWidth={2} />
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                    Email
                  </p>
                  <p className="text-sm break-all">{customerEmail}</p>
                </div>
              </div>

              {order.user_id && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                    Type de compte
                  </p>
                  <span className="inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    Utilisateur inscrit
                  </span>
                </div>
              )}

              {!order.user_id && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                    Type de compte
                  </p>
                  <span className="inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium bg-gray-100 text-gray-700 border border-gray-200">
                    Invité
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Carte Paiement */}
          <div className="bg-white border border-black">
            <div className="px-6 py-4 border-b border-black flex items-center gap-2">
              <CreditCard size={16} strokeWidth={2} />
              <h2 className="text-xs uppercase tracking-[0.2em] font-bold">
                Paiement
              </h2>
            </div>

            <div className="px-6 py-4 space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                  Montant
                </p>
                <p className="text-xl font-bold">{formattedAmount}</p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                  Statut
                </p>
                {getStatusBadge(order.status)}
              </div>

              {order.stripe_payment_id && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                    ID Paiement Stripe
                  </p>
                  <p className="text-xs font-mono break-all text-gray-600">
                    {order.stripe_payment_id}
                  </p>
                </div>
              )}

              <div className="pt-3 border-t border-gray-200">
                <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                  Date de création
                </p>
                <p className="text-sm">
                  {new Date(order.created_at).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {order.updated_at && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                    Dernière mise à jour
                  </p>
                  <p className="text-sm">
                    {new Date(order.updated_at).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
