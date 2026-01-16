"use server";

import { createClient } from "@/utils/supabase/server";
import { sendShippingConfirmationEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";

/**
 * Action pour marquer une commande comme expédiée et envoyer l'email
 */
export async function markOrderAsShipped(
  orderId: string,
  trackingNumber?: string,
  trackingUrl?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Vérifier que l'utilisateur est admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { success: false, error: "Accès refusé" };
  }

  // Récupérer la commande avec tous les détails
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    return { success: false, error: "Commande non trouvée" };
  }

  // Mettre à jour le statut
  const { error: updateError } = await supabase
    .from("orders")
    .update({
      status: "shipped",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (updateError) {
    return { success: false, error: `Erreur mise à jour: ${updateError.message}` };
  }

  // Récupérer les infos client
  let customerEmail = order.customer_email;
  let customerName = order.customer_name;

  // Si user connecté, récupérer depuis le profil
  if (order.user_id && (!customerEmail || !customerName)) {
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", order.user_id)
      .single();

    if (userProfile) {
      customerEmail = customerEmail || userProfile.email;
      customerName = customerName || userProfile.full_name;
    }
  }

  // Fallback sur shipping_address
  if (!customerEmail && order.shipping_address?.email) {
    customerEmail = order.shipping_address.email;
  }
  if (!customerName && order.shipping_address?.first_name) {
    customerName = `${order.shipping_address.first_name} ${order.shipping_address.last_name || ""}`.trim();
  }

  // Envoyer l'email d'expédition si on a un email
  if (customerEmail) {
    // Parser les items si nécessaire
    let items = order.items;
    if (typeof items === "string") {
      try {
        items = JSON.parse(items);
      } catch {
        items = [];
      }
    }

    const result = await sendShippingConfirmationEmail({
      orderId: order.id,
      customerName: customerName || "Client",
      customerEmail,
      items: (items || []).map((item: any) => ({
        product_name: item.product_name || item.name || "Produit",
        product_slug: item.product_slug || item.slug,
        quantity: item.quantity || 1,
        price_at_time: item.price_at_time || item.price || 0,
        image_url: item.image_url,
      })),
      totalAmount: order.amount,
      shippingAddress: order.shipping_address,
      trackingNumber,
      trackingUrl,
    });

    if (!result.success) {
      console.error("⚠️ Erreur envoi email expédition:", result.error);
      // On ne fait pas échouer l'action, la commande est quand même marquée comme expédiée
    }
  }

  // Créer une notification pour l'utilisateur
  if (order.user_id) {
    await supabase.from("notifications").insert({
      user_id: order.user_id,
      type: "order_status",
      title: "Commande expédiée",
      message: trackingNumber
        ? `Votre commande a été expédiée ! Numéro de suivi : ${trackingNumber}`
        : "Votre commande a été expédiée !",
      link: "/account/orders",
      is_read: false,
    });
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");

  return { success: true };
}

/**
 * Action pour mettre à jour le statut d'une commande
 */
export async function updateOrderStatus(
  orderId: string,
  status: "pending" | "paid" | "processing" | "shipped" | "completed" | "cancelled"
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Vérifier que l'utilisateur est admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { success: false, error: "Accès refusé" };
  }

  const { error } = await supabase
    .from("orders")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");

  return { success: true };
}
