import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Share2,
  Heart,
  BookOpen,
} from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useStory, useStories } from '#/hook/use-stories'
import { motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { formatLongDate } from '#/lib/date-utils'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/* ─── Fallback data (mirrors JournalPage fallbacks) ─────────────────────── */
const fallbackArticles: Record<
  string,
  {
    title: string
    tag: string
    excerpt: string
    content: string
    createdAt: string
    readTime: string
    imageUrl: string
    author: { name: string; image?: string }
  }
> = {
  'fallback-1': {
    title: 'The art of the seasonal swap: Rotating your decor',
    tag: 'Living',
    excerpt:
      'Discover the secrets to keeping your home fresh and inspired through the changing seasons with minimal effort and maximum impact.',
    content: `
<p>There is a quiet joy in the shifting of seasons. As the light changes outside, our indoor spaces naturally want to respond. But true circular living isn't about buying new decorations every three months. Instead, the art of the seasonal swap is about curation, rotation, and rediscovering the beauty of the objects you already own.</p>

<h3>1. The Curation Process</h3>
<p>Begin by taking a step back. Walk through your rooms with a fresh eye. What objects are serving a purely functional role, and which ones are emotional anchors? Seasonal rotation is first and foremost about creating breathing room. Before adding anything, try removing three items from a room. The newfound empty space will instantly make the remaining objects feel more significant.</p>

<h3>2. The Power of Textures</h3>
<p>In spring and summer, we crave lightweight linen, raw wood, and glass that catches the early morning sun. As autumn arrives, our preferences shift toward heavy wovens, brushed brass, and warm pottery. Rather than buying new, look to your storage closets or consider borrowing seasonal accents from neighbors in the community.</p>

<h3>3. Bringing the Outside In</h3>
<p>The simplest seasonal swap is entirely free: foliage. A handful of bare branches in a ceramic vase in January, a bundle of wild grasses in July, or a single brilliant branch of autumn leaves in October. It connects the indoor environment directly to the external rhythms of the natural world.</p>
    `,
    createdAt: '2024-05-12T00:00:00.000Z',
    readTime: '5 min',
    imageUrl: '/assets/feature-nook.jpg',
    author: { name: 'Elena Rossi' },
  },
  'fallback-2': {
    title: "Inside Anneli's lending atelier in Copenhagen",
    tag: 'Hosts',
    excerpt:
      'Meet the neighbor who turned her passion for Scandinavian design into a community resource for everyone in her district.',
    content: `
<p>In the heart of Copenhagen's Vesterbro neighborhood, Anneli Schmidt has built something revolutionary. Behind a forest-green storefront lies a collection of classic mid-century chairs, sculptural lighting, and handcrafted stoneware. But nothing here is for sale.</p>

<h3>A Library of Beautiful Things</h3>
<p>"We library our books, our tools, and our cars," Anneli says, pouring tea into a couple of perfectly glazed cups. "Why not library our design heritage? Beautiful spaces shouldn't require infinite wealth. They require sharing."</p>

<p>Anneli started the Lending Atelier in 2021 with just twelve items from her own home. Today, the collective inventory includes over two hundred pieces, contributed by fifty different local residents. Neighbors borrow a dining table for a weekend feast, a floor lamp for winter cozying, or a collection of handmade plates for a birthday brunch.</p>

<h3>The Ritual of Return</h3>
<p>What makes the Lending Atelier work isn't just the design value of the objects; it's the social thread it weaves. "When someone returns a chair," Anneli notes, "they return it with a story. 'We sat here and laughed till midnight.' That memory becomes part of the object's patina. It makes the next rental even more special."</p>
    `,
    createdAt: '2024-05-08T00:00:00.000Z',
    readTime: '8 min',
    imageUrl: '/assets/cat-furniture.jpg',
    author: { name: 'Marcus Lind' },
  },
  'fallback-3': {
    title: 'What 25,000 kg of CO₂ looks like in rental impact',
    tag: 'Impact',
    excerpt:
      'Measuring the environmental difference of circular consumption in our local neighborhoods through data-driven storytelling.',
    content: `
<p>Data has a way of feeling abstract. When we say circular consumption reduces environmental stress, it sounds nice. But what does it actually look like in real, measurable numbers?</p>

<h3>Visualizing the Impact</h3>
<p>Over the past year, our sharing community has successfully logged over 4,500 local rentals. By opting to rent high-quality household goods, tools, and decorative elements instead of purchasing them brand new, our members have collectively saved an estimated <strong>25,000 kilograms of CO₂ equivalents</strong>.</p>

<p>To put that in perspective, 25,000 kg of CO₂ is equivalent to:</p>
<ul>
  <li>Driving a standard gasoline car around the Earth's equator 2.5 times.</li>
  <li>The annual carbon sequestration of 1,200 fully-grown trees.</li>
  <li>Eliminating the production footprint of 830 new designer armchairs.</li>
</ul>

<h3>Beyond the Carbon</h3>
<p>While the carbon reduction is substantial, the circular footprint also saves thousands of gallons of manufacturing water and prevents valuable materials from ending up in local landfills. Every shared object is a small victory for the climate, proving that luxury and sustainability can go hand-in-hand when design meets community intentionality.</p>
    `,
    createdAt: '2024-04-28T00:00:00.000Z',
    readTime: '12 min',
    imageUrl: '/assets/cat-outdoor.jpg',
    author: { name: 'Sarah Chen' },
  },
  'fallback-4': {
    title: 'How to perfectly photograph your rental items',
    tag: 'Guides',
    excerpt:
      'A comprehensive guide to capturing the beauty and utility of your belongings to attract more borrowers.',
    content: `
<p>In a sharing marketplace, trust is your most valuable currency. And the quickest way to build trust is through honest, warm, and beautiful photography. You don't need professional cameras; a modern smartphone and a keen eye for light are more than enough.</p>

<h3>1. Chase the Natural Light</h3>
<p>Never use your camera's flash. Flash creates harsh shadows and flattens the texture of beautiful objects. Instead, position your item near a window during daylight hours. Early morning or late afternoon light (the "golden hour") adds a natural warmth that makes spaces feel lived-in and inviting.</p>

<h3>2. Provide Context and Scale</h3>
<p>A mug isolated on a white background looks like a catalog product. A mug next to an open book, sitting on a textured linen tablecloth, looks like a lifestyle. Help potential borrowers visualize how the item will integrate into their own home. Include at least one wide shot showing the item in a fully styled room.</p>

<h3>3. Show the Patina and Details</h3>
<p>Honesty is key. If a vintage wooden table has a small coffee ring or a characterful scratch, photograph it closely. Patina isn't a defect; it's a testament to the object's history and durability. Clear, close-up shots of textures and minor imperfections build immediate confidence with borrowers.</p>
    `,
    createdAt: '2024-04-15T00:00:00.000Z',
    readTime: '6 min',
    imageUrl: '/assets/feature-nook.jpg',
    author: { name: 'David Kim' },
  },
}

/* ─── Related card ───────────────────────────────────────────────────────── */
function RelatedCard({ story }: { story: any }) {
  return (
    <Link to="/journal/$id" params={{ id: story.id }} className="group block">
      <div className="relative aspect-video overflow-hidden rounded-3xl bg-surface">
        <img
          src={story.imageUrl || '/assets/feature-nook.jpg'}
          alt={story.title}
          className="h-full w-full object-cover transition-transform duration-2000 ease-out group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-black/0 transition-colors duration-700 group-hover:bg-black/10" />
        <div className="absolute bottom-4 left-4">
          <span className="rounded-full bg-background/95 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-foreground backdrop-blur-md">
            {story.tag}
          </span>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3 w-3" />
          {formatLongDate(story.createdAt)}
        </span>
        <span className="h-1 w-1 rounded-full bg-border" />
        <span className="flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          {story.readTime}
        </span>
      </div>
      <h3 className="mt-3 text-lg font-display leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary line-clamp-2">
        {story.title}
      </h3>
    </Link>
  )
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export function StoryDetail({ id }: { id: string }) {
  const navigate = useNavigate()
  const { data: dbStory, isLoading } = useStory(id)
  const { data: allStories } = useStories()
  const [isLiked, setIsLiked] = useState(false)
  const [copied, setCopied] = useState(false)

  const isFallback = id.startsWith('fallback-')
  const story = isFallback ? fallbackArticles[id] : dbStory

  /* Related stories: up to 3 others, same tag preferred */
  const relatedStories = (() => {
    const pool =
      allStories && allStories.length > 0
        ? allStories
        : Object.entries(fallbackArticles).map(([fbId, s]) => ({
            ...s,
            id: fbId,
          }))
    const others = pool.filter((s: any) => s.id !== id)
    const sameTag = others.filter((s: any) => s.tag === story?.tag)
    const rest = others.filter((s: any) => s.tag !== story?.tag)
    return [...sameTag, ...rest].slice(0, 3)
  })()

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  /* ── Loading ── */
  if (isLoading && !isFallback) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  /* ── Not found ── */
  if (!story) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-surface">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="font-display text-3xl tracking-tight">
          Story not found
        </h2>
        <p className="mt-3 max-w-sm text-muted-foreground">
          The story you're looking for doesn't exist or has been removed.
        </p>
        <Link
          to="/journal"
          className="mt-8 rounded-full border border-border px-8 py-3 text-sm font-bold transition-all hover:bg-foreground hover:text-background active:scale-95"
        >
          Back to Journal
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative h-[70vh] min-h-[480px] w-full overflow-hidden bg-surface">
        <img
          src={story.imageUrl || '/assets/feature-nook.jpg'}
          alt={story.title}
          className="h-full w-full object-cover"
        />
        {/* gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-black/10" />

        {/* top bar */}
        <div className="absolute left-0 right-0 top-0 z-10 mx-auto flex max-w-[1400px] items-center justify-between px-6 pt-6 md:px-10">
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/journal' })}
            className="h-auto flex items-center gap-2 rounded-full border border-card/20 bg-black/40 px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-primary-foreground backdrop-blur-md transition-all hover:bg-black/60 hover:text-primary-foreground active:scale-[0.98]"
          >
            <ArrowLeft size={14} />
            Journal
          </Button>

          <div className="flex gap-2.5">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsLiked((v) => !v)}
              className={`h-9 w-9 rounded-full border border-card/20 backdrop-blur-md transition-all active:scale-[0.98] ${
                isLiked
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:text-destructive-foreground'
                  : 'bg-black/40 text-primary-foreground hover:bg-black/60 hover:text-primary-foreground'
              }`}
              aria-label="Like story"
            >
              <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleShare}
              className="h-9 w-9 rounded-full border border-card/20 bg-black/40 text-primary-foreground hover:text-primary-foreground hover:bg-black/60 backdrop-blur-md transition-all active:scale-[0.98]"
              aria-label="Share story"
            >
              <Share2 size={16} />
            </Button>
          </div>
        </div>

        {/* hero text */}
        <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-[1400px] px-6 pb-12 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            <span className="rounded-full bg-primary px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-foreground">
              {story.tag}
            </span>

            <h1 className="mt-5 max-w-4xl font-display text-[clamp(2rem,5vw,3.75rem)] leading-[1.06] tracking-tight text-primary-foreground">
              {story.title}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-foreground/75">
              <span className="flex items-center gap-2">
                <Calendar size={13} />
                {formatLongDate(story.createdAt)}
              </span>
              <span className="h-1 w-1 rounded-full bg-card/30" />
              <span className="flex items-center gap-2">
                <Clock size={13} />
                {story.readTime} read
              </span>
              {story.author?.name && (
                <>
                  <span className="h-1 w-1 rounded-full bg-card/30" />
                  <span className="flex items-center gap-2">
                    <User size={13} />
                    {story.author.name}
                  </span>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Article body ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
        className="mx-auto max-w-[720px] px-6 py-16 md:px-10 md:py-24"
      >
        {/* excerpt / lead */}
        <p className="mb-12 border-l-4 border-primary pl-6 text-xl font-medium italic leading-relaxed text-muted-foreground md:text-2xl">
          {story.excerpt}
        </p>

        {/* body */}
        {story.content ? (
          <div
            className="
              prose prose-slate max-w-none
              prose-headings:font-display prose-headings:tracking-tight prose-headings:text-foreground
              prose-h3:mt-12 prose-h3:mb-4 prose-h3:text-2xl
              prose-p:text-[17px] prose-p:leading-[1.85] prose-p:text-foreground/85
              prose-li:text-[17px] prose-li:leading-[1.85] prose-li:text-foreground/85
              prose-strong:text-foreground
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            "
            dangerouslySetInnerHTML={{ __html: story.content }}
          />
        ) : (
          <div className="space-y-6 text-[17px] leading-[1.85] text-foreground/85">
            <p>
              Welcome to our sharing story segment. This catalog entry compiles
              perspectives, design wisdom, and practical guides on shared spaces
              and circular ownership.
            </p>
            <p>
              Stay tuned for more curated community insights. Feel free to
              explore our product offerings and follow dynamic catalog shifts.
            </p>
          </div>
        )}

        {/* author card */}
        {story.author?.name && (
          <div className="mt-16 flex items-center gap-5 rounded-3xl border border-border bg-surface/60 p-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              {story.author.image ? (
                <img
                  src={story.author.image}
                  alt={story.author.name}
                  className="h-14 w-14 rounded-full object-cover"
                />
              ) : (
                <User size={22} />
              )}
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Written by
              </div>
              <div className="mt-1 font-display text-lg tracking-tight text-foreground">
                {story.author.name}
              </div>
            </div>
          </div>
        )}

        {/* share / back row */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-10">
          <Link
            to="/journal"
            className="flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={15} />
            Back to Journal
          </Link>

          <Button
            variant="outline"
            onClick={handleShare}
            className="h-auto flex items-center gap-2 rounded-full border border-border px-6 py-2.5 text-sm font-bold transition-all hover:bg-foreground hover:text-background active:scale-[0.98]"
          >
            <Share2 size={14} />
            {copied ? 'Link copied!' : 'Share story'}
          </Button>
        </div>
      </motion.div>

      {/* ── Related stories ───────────────────────────────────────────────── */}
      {relatedStories.length > 0 && (
        <section className="border-t border-border/50 bg-surface/30">
          <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-24">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
                  — More stories
                </div>
                <h2 className="mt-3 font-display text-3xl tracking-tight text-foreground md:text-4xl">
                  Keep reading
                </h2>
              </div>
              <Link
                to="/journal"
                className="hidden text-sm font-bold text-muted-foreground transition-colors hover:text-foreground md:block"
              >
                View all →
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {relatedStories.map((s: any) => (
                <RelatedCard key={s.id} story={s} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Newsletter strip ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-6 pb-24 md:px-10 md:pb-32">
        <div className="rounded-[3rem] bg-foreground px-6 py-16 text-center text-background md:px-10 md:py-20">
          <div className="mx-auto max-w-xl">
            <h2 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.08] tracking-tight">
              Get the latest stories in your inbox.
            </h2>
            <p className="mt-4 text-base text-background/70">
              Join 5,000+ neighbors who receive our weekly dispatch on circular
              living and design.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
            >
              <Input
                type="email"
                placeholder="Email address"
                className="h-13 w-full rounded-full border border-background/20 bg-background/5 px-7 text-sm text-background outline-none transition-all placeholder:text-background/40 focus:border-background sm:w-[300px]"
              />
              <Button className="h-13 w-full rounded-full bg-background text-foreground hover:bg-background/90 hover:text-foreground active:scale-[0.98] px-8 text-sm font-bold sm:w-auto">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
