import '../../styles/particles/HeroVideo.css'

function HeroVideo() {
  return (
    <video
      className="hero-video"
      autoPlay
      muted
      loop
      playsInline
      poster="/assets/s4ngster-hero.webp"
    >
      <source src="/assets/s4ngster-loop.mp4" type="video/mp4" />
    </video>
  )
}

export default HeroVideo
