import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Syringe, Droplet, Bandage, Heart, Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const MaterialsStock = () => {
  const [showAIAssist, setShowAIAssist] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const supplies = [
    { name: "Gloves", icon: "🧤", stock: "12,800", assignees: "N-105, N-222", lastOrder: "April 14", days: "20" },
    { name: "Insulin Pens", icon: "💉", stock: "515", assignees: "N-291, N-060", lastOrder: "April 4", days: "18" },
    { name: "Catheters", icon: "🔬", stock: "220", assignees: "N-260", lastOrder: "April 4", days: "25", low: true },
    { name: "Wound Dressings", icon: "🏥", stock: "300", assignees: "N-260", lastOrder: "April 4", days: "30", low: true },
    { name: "Compression Stockings", icon: "🦵", stock: "180", assignees: "N-260", lastOrder: "April 4", days: "21" },
    { name: "Lancets", icon: "💉", stock: "95", assignees: "N-260", lastOrder: "March 1", days: "16", low: true },
    { name: "Incontinence Pads", icon: "🧻", stock: "90", assignees: "N-204", lastOrder: "March 1", days: "9", low: true },
    { name: "Adhesive Tape", icon: "📎", stock: "80", assignees: "N-204, N-223", lastOrder: "March 1", days: "8" },
    { name: "Syringes", icon: "💉", stock: "75", assignees: "N-203", lastOrder: "March 8", days: "5", low: true },
    { name: "Ostomy Bags", icon: "🔬", stock: "50", assignees: "N-037", lastOrder: "March 21", days: "6" },
    { name: "Medication Cups", icon: "💊", stock: "34", assignees: "N-315", lastOrder: "February", days: "10" }
  ];

  // Helper function to generate intelligent responses
  const generateGenericResponse = (query: string, supplies: any[], lowStockItems: any[], criticalItems: any[], totalItems: number, avgStock: number) => {
    let response = `AI Analysis for: "${query}"\n\n`;
    response += `**Current Inventory Overview:**\n`;
    response += `• Total items tracked: ${totalItems}\n`;
    response += `• Low stock items: ${lowStockItems.length}\n`;
    response += `• Critical items (urgent reorder needed): ${criticalItems.length}\n`;
    response += `• Average stock level: ${avgStock.toLocaleString()} units\n\n`;
    
    if (criticalItems.length > 0) {
      response += `**🚨 Immediate Action Required:**\n`;
      criticalItems.forEach(item => {
        response += `• ${item.name}: ${item.stock} units (${item.days} days remaining)\n`;
      });
      response += `\n`;
    }
    
    response += `**Key Recommendations:**\n`;
    response += `1. Prioritize reordering ${criticalItems.length > 0 ? criticalItems.map(s => s.name).join(', ') : 'critical items'}\n`;
    response += `2. Review usage patterns for items with <30 days remaining\n`;
    response += `3. Consider implementing automated reorder points\n`;
    response += `4. Explore bulk purchasing for high-usage items\n\n`;
    
    response += `Would you like more specific analysis on:\n`;
    response += `• Low stock items?\n`;
    response += `• Reorder suggestions?\n`;
    response += `• Usage trends?\n`;
    response += `• Cost analysis?`;
    
    return response;
  };

  return (
    <div className="px-8 pb-8 pt-0 space-y-6 border-2 border-cyan-400/50 rounded-lg shadow-[0_0_20px_rgba(34,211,238,0.5)] shadow-cyan-400/50 min-w-0">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Materials & Stock Management</h2>
        </div>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setShowAIAssist(true)}>
          <Sparkles className="w-4 h-4 mr-2" />
          AI Assist
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-card border-b-2 border-border">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-muted-foreground">SUPPLIES</th>
                <th className="text-left py-4 px-6 font-semibold text-muted-foreground">STOCK</th>
                <th className="text-left py-4 px-6 font-semibold text-muted-foreground">ASSIGNEDS</th>
                <th className="text-left py-4 px-6 font-semibold text-muted-foreground">LAST ORDER</th>
                <th className="text-left py-4 px-6 font-semibold text-muted-foreground">EST. DAYS</th>
              </tr>
            </thead>
            <tbody>
              {supplies.map((supply, i) => (
                <tr key={i} className="border-b border-cyan-400/50 hover:bg-muted/30">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{supply.icon}</span>
                      <span className="font-medium text-lg text-foreground">{supply.name}</span>
                      {supply.low && (
                        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                          LOW
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-xl font-semibold text-foreground">{supply.stock}</td>
                  <td className="py-4 px-6 text-muted-foreground">{supply.assignees}</td>
                  <td className="py-4 px-6 text-foreground">{supply.lastOrder}</td>
                  <td className="py-4 px-6 text-xl font-semibold text-foreground">{supply.days}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Package className="w-8 h-8 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Total Items</h3>
          </div>
          <p className="text-4xl font-bold text-primary">11</p>
          <p className="text-sm text-muted-foreground mt-2">Active supply categories</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 text-lg px-3 py-1">
              LOW STOCK
            </Badge>
          </div>
          <p className="text-4xl font-bold text-warning">5</p>
          <p className="text-sm text-muted-foreground mt-2">Items need reordering</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Heart className="w-8 h-8 text-success" />
            <h3 className="text-lg font-semibold text-foreground">Well Stocked</h3>
          </div>
          <p className="text-4xl font-bold text-success">6</p>
          <p className="text-sm text-muted-foreground mt-2">Items in good supply</p>
        </Card>
      </div>

      {/* AI Assist Dialog */}
      <Dialog open={showAIAssist} onOpenChange={setShowAIAssist}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Assist - Materials & Stock Management
            </DialogTitle>
            <DialogDescription>
              Get AI-powered insights and recommendations for inventory management
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="aiQuery">Ask AI Assistant</Label>
              <Textarea
                id="aiQuery"
                placeholder="e.g., Which items need restocking? What's the optimal order quantity for gloves? Analyze stock trends..."
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                rows={3}
              />
            </div>

            {isProcessing && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">AI is analyzing...</span>
              </div>
            )}

            {aiResponse && !isProcessing && (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-foreground">
                  <Sparkles className="w-4 h-4 text-primary" />
                  AI Response
                </h4>
                <div className="text-sm whitespace-pre-wrap text-foreground">{aiResponse}</div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="space-y-2">
              <Label>Quick Questions</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Low stock items?",
                  "Reorder suggestions",
                  "Usage trends",
                  "Cost analysis"
                ].map((question, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAiQuery(question);
                    }}
                    className="text-xs"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>

            {/* AI Insights Preview */}
            <div className="p-4 rounded-lg bg-muted space-y-3">
              <h4 className="font-semibold text-sm text-foreground">AI Insights</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 text-xs">Alert</Badge>
                  <div>
                    <p className="font-medium text-foreground">Low Stock Detected</p>
                    <p className="text-xs text-muted-foreground">3 items below recommended threshold</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">Tip</Badge>
                  <div>
                    <p className="font-medium text-foreground">Optimization Opportunity</p>
                    <p className="text-xs text-muted-foreground">Bulk ordering could save 15% on gloves</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-xs">Trend</Badge>
                  <div>
                    <p className="font-medium text-foreground">Usage Pattern</p>
                    <p className="text-xs text-muted-foreground">Insulin pens usage increased 20% this month</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAIAssist(false);
              setAiQuery("");
              setAiResponse("");
            }}>
              Close
            </Button>
            <Button 
              onClick={() => {
                if (!aiQuery.trim()) return;
                
                setIsProcessing(true);
                setAiResponse("");
                
                // Analyze actual inventory data
                const lowStockItems = supplies.filter(s => s.low);
                const criticalItems = supplies.filter(s => s.low && parseInt(s.stock.replace(/,/g, '')) < 100);
                const totalItems = supplies.length;
                const totalStock = supplies.reduce((sum, s) => sum + parseInt(s.stock.replace(/,/g, '')), 0);
                const avgStock = Math.round(totalStock / totalItems);
                
                // Simulate AI processing with actual data analysis
                setTimeout(() => {
                  const lowerQuery = aiQuery.toLowerCase().trim();
                  let response = "";
                  
                  // Handle greetings and conversational queries
                  if (lowerQuery === "hello" || lowerQuery === "hi" || lowerQuery === "hey" || lowerQuery.startsWith("hello ") || lowerQuery.startsWith("hi ") || lowerQuery.startsWith("hey ")) {
                    response = `Hello! I'm your AI Assistant for Materials & Stock Management. 👋\n\n`;
                    response += `**Quick Overview:**\n`;
                    response += `• ${totalItems} items tracked in inventory\n`;
                    response += `• ${lowStockItems.length} items need attention\n`;
                    if (criticalItems.length > 0) {
                      response += `• 🚨 ${criticalItems.length} critical items require immediate reordering\n\n`;
                    }
                    response += `**How can I help you today?**\n\n`;
                    response += `I can help you with:\n`;
                    response += `• Identifying low stock items\n`;
                    response += `• Providing reorder suggestions\n`;
                    response += `• Analyzing usage trends\n`;
                    response += `• Cost analysis and savings opportunities\n`;
                    response += `• Detailed information about specific items\n\n`;
                    response += `Try asking: "What items need reordering?" or "Show me low stock items"`;
                  } else if (lowerQuery.includes("help") || lowerQuery.includes("what can you do") || lowerQuery.includes("capabilities")) {
                    response = `I can help you manage your inventory! Here's what I can do:\n\n`;
                    response += `📊 **Inventory Analysis:**\n`;
                    response += `• Identify low stock and critical items\n`;
                    response += `• Calculate reorder quantities\n`;
                    response += `• Analyze usage patterns and trends\n\n`;
                    response += `💰 **Cost Management:**\n`;
                    response += `• Estimate inventory values\n`;
                    response += `• Suggest cost-saving opportunities\n`;
                    response += `• Provide bulk ordering recommendations\n\n`;
                    response += `📋 **Item-Specific Queries:**\n`;
                    response += `• Get detailed info about any supply item\n`;
                    response += `• Check stock levels and days remaining\n`;
                    response += `• Review assignment and order history\n\n`;
                    response += `**Example Questions:**\n`;
                    response += `• "What items are low in stock?"\n`;
                    response += `• "How many syringes should I order?"\n`;
                    response += `• "Show me usage trends"\n`;
                    response += `• "What's the cost analysis?"\n`;
                    response += `• "Tell me about gloves"`;
                  } else if (lowerQuery.includes("low stock") || lowerQuery.includes("low") || lowerQuery.includes("restock") || lowerQuery.includes("reorder")) {
                    const lowStockList = lowStockItems.map(item => {
                      const stockNum = parseInt(item.stock.replace(/,/g, ''));
                      const status = stockNum < 100 ? "Critical" : "Low";
                      return `• ${item.name}: ${item.stock} units (${status} - ${item.days} days remaining)`;
                    }).join('\n');
                    
                    response = `Based on current inventory analysis:\n\n**Low Stock Items (${lowStockItems.length}):**\n${lowStockList}\n\n**Recommendations:**\n`;
                    
                    if (criticalItems.length > 0) {
                      response += `\n🚨 **URGENT - Order Immediately:**\n`;
                      criticalItems.forEach(item => {
                        const stockNum = parseInt(item.stock.replace(/,/g, ''));
                        const recommended = Math.max(stockNum * 5, 500);
                        response += `   - ${item.name}: Order ${recommended.toLocaleString()} units (Current: ${item.stock})\n`;
                      });
                    }
                    
                    const soonItems = lowStockItems.filter(item => !criticalItems.includes(item));
                    if (soonItems.length > 0) {
                      response += `\n⚠️ **Order This Week:**\n`;
                      soonItems.forEach(item => {
                        const stockNum = parseInt(item.stock.replace(/,/g, ''));
                        const recommended = Math.max(stockNum * 4, 400);
                        response += `   - ${item.name}: Order ${recommended.toLocaleString()} units (Current: ${item.stock})\n`;
                      });
                    }
                  } else if (lowerQuery.includes("trend") || lowerQuery.includes("usage") || lowerQuery.includes("pattern") || lowerQuery.includes("consumption")) {
                    const highStock = supplies.filter(s => parseInt(s.stock.replace(/,/g, '')) > 1000);
                    const mediumStock = supplies.filter(s => {
                      const stock = parseInt(s.stock.replace(/,/g, ''));
                      return stock > 100 && stock <= 1000;
                    });
                    
                    // Calculate consumption rates
                    const consumptionRates = supplies.map(s => {
                      const stock = parseInt(s.stock.replace(/,/g, ''));
                      const days = parseInt(s.days);
                      const dailyRate = stock / days;
                      return { name: s.name, dailyRate, stock, days };
                    }).sort((a, b) => b.dailyRate - a.dailyRate);
                    
                    response = `Usage Pattern Analysis:\n\n**Current Inventory Distribution:**\n`;
                    response += `• High Stock (>1,000 units): ${highStock.length} items\n`;
                    response += `  - ${highStock.map(s => s.name).join(', ')}\n\n`;
                    response += `• Medium Stock (100-1,000 units): ${mediumStock.length} items\n`;
                    response += `  - ${mediumStock.map(s => s.name).join(', ')}\n\n`;
                    response += `• Low Stock (<100 units): ${lowStockItems.length} items\n`;
                    response += `  - ${lowStockItems.map(s => s.name).join(', ')}\n\n`;
                    response += `**Consumption Rates (Top 5):**\n`;
                    consumptionRates.slice(0, 5).forEach((item, i) => {
                      response += `${i + 1}. ${item.name}: ~${Math.round(item.dailyRate)} units/day (${item.stock} units, ${item.days} days remaining)\n`;
                    });
                    response += `\n**Insights:**\n`;
                    response += `• Average stock level: ${avgStock.toLocaleString()} units\n`;
                    response += `• Items needing attention: ${lowStockItems.length} (${Math.round(lowStockItems.length / totalItems * 100)}%)\n`;
                    response += `• Most critical: ${criticalItems.map(s => s.name).join(', ')}\n`;
                    response += `• Highest consumption: ${consumptionRates[0].name} (~${Math.round(consumptionRates[0].dailyRate)} units/day)\n`;
                  } else if (lowerQuery.includes("cost") || lowerQuery.includes("price") || lowerQuery.includes("budget") || lowerQuery.includes("save") || lowerQuery.includes("spend") || lowerQuery.includes("expense")) {
                    const estimatedCosts: { [key: string]: number } = {
                      "Gloves": 0.05,
                      "Insulin Pens": 25,
                      "Catheters": 2.5,
                      "Wound Dressings": 1.8,
                      "Compression Stockings": 12,
                      "Lancets": 0.15,
                      "Incontinence Pads": 0.8,
                      "Adhesive Tape": 0.3,
                      "Syringes": 0.2,
                      "Ostomy Bags": 3.5,
                      "Medication Cups": 0.1
                    };
                    
                    const monthlyValue = supplies.reduce((sum, s) => {
                      const stock = parseInt(s.stock.replace(/,/g, ''));
                      const cost = estimatedCosts[s.name] || 1;
                      return sum + (stock * cost);
                    }, 0);
                    
                    const lowStockValue = lowStockItems.reduce((sum, s) => {
                      const stock = parseInt(s.stock.replace(/,/g, ''));
                      const cost = estimatedCosts[s.name] || 1;
                      return sum + (stock * cost);
                    }, 0);
                    
                    response = `Cost Analysis:\n\n**Current Inventory Value:**\n`;
                    response += `• Total inventory value: $${(monthlyValue / 1000).toFixed(1)}K\n`;
                    response += `• Low stock items value: $${(lowStockValue / 1000).toFixed(1)}K\n\n`;
                    response += `**Savings Opportunities:**\n`;
                    response += `1. Bulk ordering (6-month supply): Save ~15% on high-volume items\n`;
                    response += `2. Supplier negotiation: Potential 10% discount on orders >$5,000\n`;
                    response += `3. Automated reordering: Reduce stockouts and emergency orders\n\n`;
                    response += `**Projected Monthly Savings:** $1,200-$1,500 with optimization\n`;
                  } else if (lowerQuery.includes("how many") || lowerQuery.includes("quantity") || lowerQuery.includes("amount") || lowerQuery.includes("count")) {
                    // Handle quantity questions
                    if (lowerQuery.includes("total") || lowerQuery.includes("all items")) {
                      response = `**Total Inventory Count:**\n\n`;
                      response += `• Total items tracked: ${totalItems}\n`;
                      response += `• Total units in stock: ${totalStock.toLocaleString()} units\n`;
                      response += `• Average units per item: ${avgStock.toLocaleString()} units\n\n`;
                      response += `**Breakdown by Status:**\n`;
                      response += `• Well stocked: ${totalItems - lowStockItems.length} items\n`;
                      response += `• Low stock: ${lowStockItems.length} items\n`;
                      response += `• Critical (urgent): ${criticalItems.length} items\n`;
                    } else {
                      response = generateGenericResponse(aiQuery, supplies, lowStockItems, criticalItems, totalItems, avgStock);
                    }
                  } else if (lowerQuery.includes("when") || lowerQuery.includes("time") || lowerQuery.includes("schedule")) {
                    // Handle timing/scheduling questions
                    const soonestExpiring = [...supplies].sort((a, b) => parseInt(a.days) - parseInt(b.days));
                    response = `**Timing & Scheduling Analysis:**\n\n`;
                    response += `**Items Expiring Soonest:**\n`;
                    soonestExpiring.slice(0, 5).forEach((item, i) => {
                      response += `${i + 1}. ${item.name}: ${item.days} days remaining (${item.stock} units)\n`;
                    });
                    response += `\n**Recommended Action Timeline:**\n`;
                    response += `• **Immediate (This Week):** ${criticalItems.map(s => s.name).join(', ')}\n`;
                    const soonItems = lowStockItems.filter(s => !criticalItems.includes(s) && parseInt(s.days) < 20);
                    if (soonItems.length > 0) {
                      response += `• **Within 2 Weeks:** ${soonItems.map(s => s.name).join(', ')}\n`;
                    }
                    response += `• **Monitor Closely:** Items with <30 days remaining\n`;
                  } else if (lowerQuery.includes("who") || lowerQuery.includes("assign") || lowerQuery.includes("nurse")) {
                    // Handle assignment questions
                    const assignments: { [key: string]: string[] } = {};
                    supplies.forEach(s => {
                      s.assignees.split(', ').forEach(assignee => {
                        if (!assignments[assignee]) assignments[assignee] = [];
                        assignments[assignee].push(s.name);
                      });
                    });
                    
                    response = `**Assignment Overview:**\n\n`;
                    Object.entries(assignments).forEach(([assignee, items]) => {
                      response += `**${assignee}:** ${items.length} items\n`;
                      response += `  - ${items.join(', ')}\n\n`;
                    });
                    response += `**Total Assignees:** ${Object.keys(assignments).length}\n`;
                    response += `**Most Assigned:** ${Object.entries(assignments).sort((a, b) => b[1].length - a[1].length)[0][0]} (${Object.entries(assignments).sort((a, b) => b[1].length - a[1].length)[0][1].length} items)\n`;
                  } else if (lowerQuery.includes("specific") || lowerQuery.includes("item") || lowerQuery.includes("about") || supplies.some(s => lowerQuery.includes(s.name.toLowerCase()) || lowerQuery.includes(s.name.split(' ')[0].toLowerCase()))) {
                    // Find specific item mentioned
                    const mentionedItem = supplies.find(s => 
                      lowerQuery.includes(s.name.toLowerCase()) || 
                      lowerQuery.includes(s.name.split(' ')[0].toLowerCase()) ||
                      s.name.split(' ').some(word => lowerQuery.includes(word.toLowerCase()))
                    );
                    
                    if (mentionedItem) {
                      const stockNum = parseInt(mentionedItem.stock.replace(/,/g, ''));
                      const dailyConsumption = stockNum / parseInt(mentionedItem.days);
                      response = `**Detailed Analysis: ${mentionedItem.name}**\n\n`;
                      response += `**Current Status:**\n`;
                      response += `• Stock Level: ${mentionedItem.stock} units\n`;
                      response += `• Status: ${mentionedItem.low ? '⚠️ LOW STOCK - Action Required' : '✅ Adequate'}\n`;
                      response += `• Days Remaining: ${mentionedItem.days} days\n`;
                      response += `• Estimated Daily Consumption: ~${Math.round(dailyConsumption)} units/day\n\n`;
                      response += `**Assignment & Order History:**\n`;
                      response += `• Assigned to: ${mentionedItem.assignees}\n`;
                      response += `• Last Order Date: ${mentionedItem.lastOrder}\n`;
                      response += `• Days Since Last Order: ${mentionedItem.days} days\n\n`;
                      
                      if (mentionedItem.low) {
                        const recommended = Math.max(stockNum * 5, 500);
                        const projectedDays = Math.round(recommended / dailyConsumption);
                        response += `**🚨 URGENT RECOMMENDATION:**\n`;
                        response += `• Order Quantity: ${recommended.toLocaleString()} units\n`;
                        response += `• Projected Supply Duration: ~${projectedDays} days\n`;
                        response += `• Priority: ${stockNum < 100 ? 'CRITICAL - Order immediately' : 'HIGH - Order this week'}\n`;
                        response += `• Reason: Current stock will last only ${mentionedItem.days} more days\n`;
                      } else {
                        response += `**Status:** Stock levels are adequate.\n`;
                        response += `• Current supply will last ${mentionedItem.days} days\n`;
                        response += `• Monitor usage patterns and reorder when stock drops below 200 units\n`;
                      }
                    } else {
                      response = generateGenericResponse(aiQuery, supplies, lowStockItems, criticalItems, totalItems, avgStock);
                    }
                  } else if (lowerQuery.includes("summary") || lowerQuery.includes("overview") || lowerQuery.includes("status") || lowerQuery.includes("report")) {
                    // Handle summary/overview questions
                    const wellStocked = supplies.filter(s => !s.low);
                    response = `**Inventory Summary Report**\n\n`;
                    response += `**Overall Status:**\n`;
                    response += `• Total Items: ${totalItems}\n`;
                    response += `• Total Units: ${totalStock.toLocaleString()}\n`;
                    response += `• Average Stock: ${avgStock.toLocaleString()} units/item\n\n`;
                    response += `**Stock Status Breakdown:**\n`;
                    response += `• ✅ Well Stocked: ${wellStocked.length} items (${Math.round(wellStocked.length / totalItems * 100)}%)\n`;
                    response += `• ⚠️ Low Stock: ${lowStockItems.length} items (${Math.round(lowStockItems.length / totalItems * 100)}%)\n`;
                    response += `• 🚨 Critical: ${criticalItems.length} items (${Math.round(criticalItems.length / totalItems * 100)}%)\n\n`;
                    response += `**Critical Items Requiring Immediate Action:**\n`;
                    criticalItems.forEach(item => {
                      response += `• ${item.name}: ${item.stock} units (${item.days} days remaining)\n`;
                    });
                    response += `\n**Recommendations:**\n`;
                    response += `1. Place urgent orders for ${criticalItems.length} critical items\n`;
                    response += `2. Review and reorder ${lowStockItems.length - criticalItems.length} low stock items this week\n`;
                    response += `3. Monitor ${wellStocked.length} well-stocked items for future planning\n`;
                  } else if (lowerQuery.includes("compare") || lowerQuery.includes("difference") || lowerQuery.includes("versus")) {
                    // Handle comparison questions
                    const sortedByStock = [...supplies].sort((a, b) => parseInt(b.stock.replace(/,/g, '')) - parseInt(a.stock.replace(/,/g, '')));
                    response = `**Stock Level Comparison:**\n\n`;
                    response += `**Highest Stock Items:**\n`;
                    sortedByStock.slice(0, 3).forEach((item, i) => {
                      response += `${i + 1}. ${item.name}: ${item.stock} units\n`;
                    });
                    response += `\n**Lowest Stock Items:**\n`;
                    sortedByStock.slice(-3).reverse().forEach((item, i) => {
                      response += `${i + 1}. ${item.name}: ${item.stock} units\n`;
                    });
                    response += `\n**Stock Range:**\n`;
                    response += `• Highest: ${sortedByStock[0].stock} units (${sortedByStock[0].name})\n`;
                    response += `• Lowest: ${sortedByStock[sortedByStock.length - 1].stock} units (${sortedByStock[sortedByStock.length - 1].name})\n`;
                    response += `• Difference: ${(parseInt(sortedByStock[0].stock.replace(/,/g, '')) - parseInt(sortedByStock[sortedByStock.length - 1].stock.replace(/,/g, ''))).toLocaleString()} units\n`;
                  } else {
                    // Generic intelligent response based on query context
                    response = generateGenericResponse(aiQuery, supplies, lowStockItems, criticalItems, totalItems, avgStock);
                  }
                  
                  setAiResponse(response);
                  setIsProcessing(false);
                }, 2000);
              }}
              disabled={isProcessing || !aiQuery.trim()}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Ask AI
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaterialsStock;
