export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    try {
      const data = await request.json();
      const message = `
🎉 สอบถามคิว Photo Booth ใหม่!
━━━━━━━━━━━━━━━━
👤 ชื่อ: ${data.name}
📞 โทร: ${data.phone}
📅 วันงาน: ${data.date}
📦 แพ็กเกจ: ${data.package}
➕ Add-on: ${data.addon || '-'}
📍 สถานที่: ${data.detail || '-'}
━━━━━━━━━━━━━━━━
⏰ เวลาที่สอบถาม: ${new Date().toLocaleString('th-TH')}
      `.trim();
      
      const lineResponse = await fetch('https://notify-api.line.me/api/notify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.LINE_NOTIFY_TOKEN}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ message }),
      });
      const result = await lineResponse.json();
      if (result.status === 200) {
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error('LINE Notify failed');
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};