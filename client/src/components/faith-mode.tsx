import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, BookOpen, HandHelping } from "lucide-react";

const DAILY_VERSES = [
  {
    text: "She is clothed with strength and dignity; she can laugh at the days to come.",
    reference: "Proverbs 31:25"
  },
  {
    text: "He gives strength to the weary and increases the power of the weak.",
    reference: "Isaiah 40:29"
  },
  {
    text: "The Lord your God is with you, the Mighty Warrior who saves. He will take great delight in you; in his love he will no longer rebuke you, but will rejoice over you with singing.",
    reference: "Zephaniah 3:17"
  },
  {
    text: "Cast all your anxiety on him because he cares for you.",
    reference: "1 Peter 5:7"
  },
  {
    text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.",
    reference: "Isaiah 40:31"
  }
];

const PRAYER_PROMPTS = [
  "Take a moment to thank God for your body and its resilience.",
  "Pray for wisdom for your healthcare providers.",
  "Ask for strength to face today's challenges with grace.",
  "Reflect on God's faithfulness in your health journey.",
  "Pray for peace and rest for your mind and body."
];

export function FaithMode() {
  // Get today's verse based on day of the year
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const todaysVerse = DAILY_VERSES[dayOfYear % DAILY_VERSES.length];
  const todaysPrompt = PRAYER_PROMPTS[dayOfYear % PRAYER_PROMPTS.length];

  const handlePrayerReflection = () => {
    // This could open a prayer journal or meditation timer
    console.log("Opening prayer & reflection mode");
  };

  return (
    <section className="px-4 mb-6">
      <div className="gradient-faith rounded-2xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Heart className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg text-primary">Daily Encouragement</h3>
        </div>
        
        <blockquote className="text-purple-800 dark:text-purple-200 italic mb-4 leading-relaxed">
          "{todaysVerse.text}"
        </blockquote>
        
        <p className="text-sm text-purple-700 dark:text-purple-300 font-medium mb-4">
          - {todaysVerse.reference}
        </p>
        
        <div className="bg-white bg-opacity-50 dark:bg-black dark:bg-opacity-20 rounded-xl p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
              Reflection for Today
            </p>
          </div>
          <p className="text-sm text-purple-700 dark:text-purple-300">
            {todaysPrompt}
          </p>
        </div>
        
        <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
          Your journey through this health challenge is not walked alone. Take a moment for reflection and hope.
        </p>
        
        <Button
          onClick={handlePrayerReflection}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm"
        >
          <HandHelping className="h-4 w-4 mr-2" />
          Prayer & Reflection
        </Button>
      </div>
    </section>
  );
}
