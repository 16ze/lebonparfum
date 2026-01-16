"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

/**
 * Schéma de validation pour le formulaire de contact
 */
const contactFormSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  email: z.string().email("Email invalide"),
  subject: z.enum(["commande", "info", "autre"], {
    errorMap: () => ({ message: "Veuillez sélectionner un sujet" }),
  }),
  message: z
    .string()
    .min(10, "Le message doit contenir au moins 10 caractères")
    .max(2000, "Le message ne peut pas dépasser 2000 caractères"),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

export type ContactFormState = {
  success?: boolean;
  error?: string;
  fieldErrors?: {
    name?: string[];
    email?: string[];
    subject?: string[];
    message?: string[];
  };
};

/**
 * Server Action pour traiter le formulaire de contact
 */
export async function submitContactForm(
  prevState: ContactFormState | null,
  formData: FormData
): Promise<ContactFormState> {
  try {
    // Extraction et validation des données
    const rawData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    };

    const validatedData = contactFormSchema.safeParse(rawData);

    if (!validatedData.success) {
      return {
        error: "Veuillez corriger les erreurs dans le formulaire",
        fieldErrors: validatedData.error.flatten().fieldErrors,
      };
    }

    const { name, email, subject, message } = validatedData.data;

    // TODO: Intégrer Resend ou un autre service d'email ici
    // Exemple avec Resend (à décommenter une fois configuré):
    /*
    import { Resend } from "resend";
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    await resend.emails.send({
      from: "contact@theparfumeriee.com",
      to: "contact@theparfumeriee.com",
      subject: `Contact: ${subject}`,
      html: `
        <h2>Nouveau message de contact</h2>
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Sujet:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    });
    */

    // Pour l'instant, on log dans la console (à remplacer par l'envoi d'email)
    console.log("📧 [CONTACT FORM] Nouveau message reçu:", {
      name,
      email,
      subject,
      message: message.substring(0, 100) + "...",
      timestamp: new Date().toISOString(),
    });

    // Révalidation du cache pour rafraîchir la page
    revalidatePath("/contact");

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ [CONTACT FORM] Erreur:", error);
    return {
      error: "Une erreur est survenue. Veuillez réessayer plus tard.",
    };
  }
}
