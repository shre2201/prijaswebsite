/**
 * Client messages, transcribed from the "feedback!" highlight on @prijas.skincare.
 * Every quote is real. Longer messages are shortened to their key line ("…" marks a cut)
 * and spelling is lightly tidied. Hinglish keeps the original with an English line.
 *
 * `name` is the client's first name where the highlight shows it; otherwise null.
 */
export type Concern = "Hair" | "Pigmentation & tan" | "Acne" | "Glow" | "Facials";

export const CONCERNS: Concern[] = ["Pigmentation & tan", "Acne", "Hair", "Facials", "Glow"];

export interface Review {
  quote: string;
  translation?: string;
  name: string | null;
  concern: Concern;
}

/** Shown large at the top of the section. */
export const LEAD_REVIEW: Review = {
  quote:
    "I was dealing with pigmentation issues, and she gave me valuable advice — including foods with long-term benefits for my skin. Within just two months, I noticed amazing results. She never pushes unnecessary products; she only recommends what your skin truly needs.",
  name: null,
  concern: "Pigmentation & tan",
};

export const REVIEWS: Review[] = [
  // Pigmentation & tan
  { quote: "All my dark spots have faded away. I’ve tried a lot of products but nothing has worked this magically for me.", name: "Janvi", concern: "Pigmentation & tan" },
  { quote: "The tan has completely gone from my face. I saw the results in around a month.", name: "Neha", concern: "Pigmentation & tan" },
  { quote: "The dark spots have lightened considerably and the dark circles have reduced noticeably.", name: "Monica", concern: "Pigmentation & tan" },
  { quote: "Reduced to next level — seems like pigmentation tha hi nahi.", translation: "As if it was never there.", name: null, concern: "Pigmentation & tan" },
  { quote: "Dark spots are lighter, skin feels very soft and even my pores look smaller.", name: null, concern: "Pigmentation & tan" },
  { quote: "I have started observing changes in my skin tone. It’s slightly even now.", name: null, concern: "Pigmentation & tan" },
  { quote: "Colour has improved. I am happy.", name: "Smita", concern: "Pigmentation & tan" },
  { quote: "Everyone noticed the changes on my face.", name: null, concern: "Pigmentation & tan" },

  // Acne
  { quote: "There’s no acne now, and no new ones coming. Only marks are left.", name: "Isha", concern: "Acne" },
  { quote: "No active acne right now. Skin is getting smooth — no red skin like before.", name: null, concern: "Acne" },
  { quote: "Pigmentation spots are getting lighter. Acne, pimples, blackheads and whiteheads are slowly reducing.", name: null, concern: "Acne" },
  { quote: "The bumps on my forehead are gone. There’s a huge difference — it’s glowing and looks hydrated.", name: null, concern: "Acne" },
  { quote: "Mom’s skin has become quite bright, and even my acne has reduced.", name: null, concern: "Acne" },
  { quote: "Thank you for the magic you have done for Ishank’s skin.", name: null, concern: "Acne" },

  // Hair
  { quote: "The mask worked like magic. I had zero hair fall for two days straight.", name: "Shreya", concern: "Hair" },
  { quote: "There is a drastic change in hair fall.", name: "Jasmine", concern: "Hair" },
  { quote: "Only 4–5 strands fall when I comb my hair now. I’m feeling so good about my hair.", name: null, concern: "Hair" },
  { quote: "My hair fall reduced by around 70% in a single use. I’ll recommend it to my gym clients too.", name: null, concern: "Hair" },
  { quote: "Vinod sends a lot of thanks — his dandruff is so much better.", name: null, concern: "Hair" },
  { quote: "Feeling so good about my skin and hair. Divine blessings to you.", name: null, concern: "Hair" },

  // Facials
  { quote: "It’s been a week since the facial and the glow is amazing. People ask what treatment I had — they’re surprised it’s organic.", name: null, concern: "Facials" },
  { quote: "Organic facial has done wonders to my skin. I am in love with my skin again. You are a magician.", name: null, concern: "Facials" },
  { quote: "After the first service itself I was really surprised with the results on my skin.", name: null, concern: "Facials" },
  { quote: "Skin looks very clean and soft. Very happy with the result.", name: "Vidhi", concern: "Facials" },
  { quote: "The wine clean-up was awesome. Will try the facial this time.", name: null, concern: "Facials" },

  // Glow & everyday care
  { quote: "Your night cream is mind-blowing. My skin is glowing, with no side effects.", name: null, concern: "Glow" },
  { quote: "I’m your repeat customer for sure. I saw a very good result on my face in no time.", name: "Nimesh", concern: "Glow" },
  { quote: "I can never stop using your products. They’re a part of my life now.", name: "Sachi", concern: "Glow" },
  { quote: "Tumhare paas magic hai. Mera confidence wapas aa raha hai.", translation: "You have magic. My confidence is coming back.", name: null, concern: "Glow" },
  { quote: "Our whole family has used your products — the results are very good. We need to reorder.", name: "Suraj", concern: "Glow" },
  { quote: "After 1.5 months of night cream, water and a bit of diet, I can feel my skin becoming healthy.", name: null, concern: "Glow" },
  { quote: "Using your night cream, packs and toner daily. A lot of difference — friends are complimenting me too.", name: null, concern: "Glow" },
  { quote: "Lots of compliments on my new skin. Everyone says it looks healthier and glowing.", name: null, concern: "Glow" },
  { quote: "Even when I post a story, people comment that my skin is glowing.", name: null, concern: "Glow" },
  { quote: "Blessed that I got my natural skin back.", name: null, concern: "Glow" },
  { quote: "A very good improvement in my skin from just using the cream for 10 days.", name: null, concern: "Glow" },
  { quote: "I do see visible results after changing the formula. Just wanted to thank you.", name: null, concern: "Glow" },
  { quote: "Your lip balm is too good. Loved it so much I applied it at night too.", name: null, concern: "Glow" },
  { quote: "My skin is absolutely fab. Your cream is amazing.", name: "Smita", concern: "Glow" },
  { quote: "The cream really helps my skin look plumper.", name: null, concern: "Glow" },
  { quote: "Very good transformation. He is happy — that truly matters.", name: null, concern: "Glow" },
  { quote: "Super results. Highly satisfied.", name: null, concern: "Glow" },
  { quote: "Superb — I can see the changes.", name: null, concern: "Glow" },
  { quote: "Loved the shea butter bomb.", name: null, concern: "Glow" },
];
