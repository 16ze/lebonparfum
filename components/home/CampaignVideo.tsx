/**
 * CampaignVideo - Section Vidéo Plein Écran avec Effet Rideau
 *
 * Design :
 * - Vidéo en autoplay, loop, muted, playsInline
 * - Plein écran (100dvh) pour mobile-safe
 * - z-10 bg-white : IMPORTANT pour l'effet rideau (passe par-dessus le Showcase sticky)
 */

export default function CampaignVideo() {
  return (
    <section className="relative z-10 w-full h-[100dvh] bg-white overflow-hidden">
      {/* Vidéo Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
      >
        <source src="/campaign-video.mp4" type="video/mp4" />
      </video>
    </section>
  );
}
