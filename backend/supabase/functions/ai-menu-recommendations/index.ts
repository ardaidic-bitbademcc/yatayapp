// Supabase Edge Function: ai-menu-recommendations (taslak)
// Kaynak: sistem_design.txt 10.1 bölümündeki örnekten uyarlanmıştır.
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

interface MenuItemInput {
  id: string;
  popularity_score: number;
  profit_margin: number;
  category: 'star' | 'puzzle' | 'plow_horse' | 'dog' | string;
  sales_trend?: number[];
  selling_price?: number;
}

interface MenuAnalysisRequest {
  menu_items: MenuItemInput[];
}

serve(async (req) => {
  try {
    const { menu_items } = (await req.json()) as MenuAnalysisRequest;

    const recommendations = menu_items.map((item) => {
      let action: string;
      let reasoning: string;
      let suggested_price: number | null = null;
      let expected_impact: Record<string, number> = {};

      switch (item.category) {
        case 'star':
          action = 'promote';
          reasoning = 'Yüksek kar ve popülerlik. Menüde öne çıkarın, upselling yapın.';
          expected_impact = { revenue_change: 15, profit_change: 20 };
          break;
        case 'puzzle':
          action = 'reprice';
          reasoning = 'Yüksek kar ama düşük popülerlik. Fiyat düşürün veya pazarlamayı artırın.';
          suggested_price = calculateOptimalPrice(item, 'down');
          expected_impact = { revenue_change: 25, profit_change: 10 };
          break;
        case 'plow_horse':
          action = 'optimize';
          reasoning = 'Yüksek popülerlik ama düşük kar. Maliyetleri düşürün veya fiyat artırın.';
          suggested_price = calculateOptimalPrice(item, 'up');
          expected_impact = { revenue_change: 5, profit_change: 30 };
          break;
        case 'dog':
          action = 'remove';
          reasoning = 'Düşük kar ve popülerlik. Menüden çıkarın veya tamamen yenileyin.';
          expected_impact = { revenue_change: -5, profit_change: 5 };
          break;
        default:
          action = 'monitor';
          reasoning = 'Daha fazla veri gerekli.';
      }

      return {
        menu_item_id: item.id,
        category: item.category,
        action,
        suggested_price,
        reasoning,
        expected_impact,
      };
    });

    const overall_insights = generateOverallInsights(menu_items, recommendations);

    return new Response(
      JSON.stringify({ recommendations, overall_insights }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 400 });
  }
});

function calculateOptimalPrice(item: MenuItemInput, dir: 'up' | 'down'): number {
  const current = item.selling_price ?? 0;
  return dir === 'down' ? current * 0.9 : current * 1.1;
}

function generateOverallInsights(items: MenuItemInput[], recommendations: any[]): string {
  const starCount = items.filter((i) => i.category === 'star').length;
  const dogCount = items.filter((i) => i.category === 'dog').length;
  const total = items.length || 1;

  let insights = `Menü Analizi: ${total} ürün incelendi.\n\n`;
  insights += `⭐ Yıldız Ürünler: ${starCount} (${((starCount / total) * 100).toFixed(1)}%)\n`;
  insights += `🐕 Zayıf Ürünler: ${dogCount} (${((dogCount / total) * 100).toFixed(1)}%)\n`;
  return insights;
}
