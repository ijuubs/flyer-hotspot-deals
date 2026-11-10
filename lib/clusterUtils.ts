import { ProductDetail, HotspotCluster, HotspotBox } from '@/types/flyer';

/**
 * Spatial Auto-Grouping Algorithm:
 * Identifies visually adjacent products in the flyer image and merges their
 * hotspots into a single 'cluster zone' for easy selection.
 */
export function autoGroupAdjacentProducts(
  products: ProductDetail[],
  maxGapPct: number = 14
): HotspotCluster[] {
  if (!products || products.length === 0) return [];

  const n = products.length;
  const adj: number[][] = Array.from({ length: n }, () => []);

  // Check spatial adjacency between every pair of products
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const b1 = products[i].box;
      const b2 = products[j].box;

      // Calculate edge gaps in %
      const gapX = Math.max(0, Math.max(b1.x, b2.x) - Math.min(b1.x + b1.width, b2.x + b2.width));
      const gapY = Math.max(0, Math.max(b1.y, b2.y) - Math.min(b1.y + b1.height, b2.y + b2.height));

      // Same category gets a slightly wider spatial tolerance
      const categoryMatch = products[i].category === products[j].category;
      const effectiveMaxGap = categoryMatch ? maxGapPct * 1.3 : maxGapPct;

      if (gapX <= effectiveMaxGap && gapY <= effectiveMaxGap) {
        adj[i].push(j);
        adj[j].push(i);
      }
    }
  }

  // Find connected components using Breadth-First Search (BFS)
  const visited = new Array(n).fill(false);
  const clusters: HotspotCluster[] = [];

  for (let i = 0; i < n; i++) {
    if (visited[i]) continue;

    const componentIndices: number[] = [];
    const queue: number[] = [i];
    visited[i] = true;

    while (queue.length > 0) {
      const curr = queue.shift()!;
      componentIndices.push(curr);

      for (const neighbor of adj[curr]) {
        if (!visited[neighbor]) {
          visited[neighbor] = true;
          queue.push(neighbor);
        }
      }
    }

    // Only create a cluster if 2 or more products are grouped together
    if (componentIndices.length >= 2) {
      const componentProducts = componentIndices.map((idx) => products[idx]);

      let minX = 100;
      let minY = 100;
      let maxX = 0;
      let maxY = 0;
      let totalPrice = 0;

      const categoryCounts: Record<string, number> = {};

      componentProducts.forEach((p) => {
        minX = Math.min(minX, p.box.x);
        minY = Math.min(minY, p.box.y);
        maxX = Math.max(maxX, p.box.x + p.box.width);
        maxY = Math.max(maxY, p.box.y + p.box.height);
        totalPrice += p.dealPrice;
        categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
      });

      // Determine dominant category
      let dominantCat = componentProducts[0].category;
      let maxCount = 0;
      Object.entries(categoryCounts).forEach(([cat, count]) => {
        if (count > maxCount) {
          maxCount = count;
          dominantCat = cat;
        }
      });

      const clusterBox: HotspotBox = {
        x: Math.max(0, Math.round((minX - 0.5) * 10) / 10),
        y: Math.max(0, Math.round((minY - 0.5) * 10) / 10),
        width: Math.min(100 - minX, Math.round((maxX - minX + 1) * 10) / 10),
        height: Math.min(100 - minY, Math.round((maxY - minY + 1) * 10) / 10),
      };

      clusters.push({
        id: `cluster-${Date.now()}-${clusters.length}-${Math.random().toString(36).substring(2, 6)}`,
        name: `${dominantCat} Cluster (${componentProducts.length} Deals)`,
        category: dominantCat,
        box: clusterBox,
        productIds: componentProducts.map((p) => p.id),
        totalDealsCount: componentProducts.length,
        averagePrice: Math.round((totalPrice / componentProducts.length) * 100) / 100,
      });
    }
  }

  return clusters;
}

/**
 * Check if a product box falls within or intersects a lasso selection rectangle
 */
export function isBoxIntersecting(
  box: HotspotBox,
  rect: { x: number; y: number; width: number; height: number }
): boolean {
  const rectX2 = rect.x + rect.width;
  const rectY2 = rect.y + rect.height;

  const boxX2 = box.x + box.width;
  const boxY2 = box.y + box.height;

  return !(box.x > rectX2 || boxX2 < rect.x || box.y > rectY2 || boxY2 < rect.y);
}
