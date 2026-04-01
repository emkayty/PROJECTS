import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and get user
    const users = await sql`
      SELECT id, username FROM users WHERE session_token = ${token}
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const user = users[0];
    const { messages } = await request.json() as { messages: Message[] };

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    // Call OpenAI API
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      return NextResponse.json({ 
        error: 'OpenAI API key not configured',
        message: 'I apologize, but AI assistance is not currently available. Please contact support.'
      }, { status: 503 });
    }

    const systemMessage = {
      role: 'system',
      content: `You are an expert AI assistant for a professional BIOS, firmware, schematics, and electronics repair platform. You provide comprehensive technical support for:

**DEVICE CATEGORIES:**
- Laptops (Dell, HP, Lenovo, Asus, Acer, MSI, Razer, Alienware, Toshiba, Samsung, LG)
- MacBooks (Air, Pro, all models)
- Desktop Motherboards (Intel, AMD, all brands)
- All-in-One PCs
- Tablets (iPad, Surface, Android tablets)
- Gaming Consoles (PlayStation, Xbox, Nintendo Switch)
- Smartphones (iPhone, Android)
- Servers & Workstations
- Network Equipment (routers, switches)
- NLBA1 devices

**REPAIR SERVICES:**
- BIOS/UEFI programming & recovery
- EC (Embedded Controller) programming
- Chip-level repair & diagnostics
- Component-level troubleshooting
- Power supply repair (voltage rails, MOSFETs, capacitors)
- GPU repair & reballing
- CPU socket repair
- RAM slot repair
- Water/liquid damage recovery
- Data recovery
- Circuit tracing & analysis
- SMD soldering & rework
- BGA reballing & reflow
- Microsoldering
- BIOS password removal
- ME (Management Engine) region repair

**TECHNICAL RESOURCES:**
- Schematic diagrams (boardview files)
- BIOS firmware files (Dell, HP, Lenovo, etc.)
- EC firmware
- Service manuals & disassembly guides
- Component datasheets (ICs, MOSFETs, voltage regulators)
- Pinout diagrams
- Voltage rail charts
- Block diagrams
- Component location maps
- PCB layer analysis

**DIAGNOSTIC TECHNIQUES:**
- Multimeter testing (continuity, resistance, voltage)
- Oscilloscope signal analysis
- Logic analyzer usage
- Power-on sequence analysis
- POST code debugging
- BIOS beep codes
- LED diagnostic codes
- Current draw analysis
- Short circuit detection
- Thermal imaging

**COMMON ISSUES & SOLUTIONS:**
- No power / Dead motherboard
- No display / Black screen
- No POST / Boot failure
- Boot loops
- BIOS corruption / Brick recovery
- Overheating / Thermal shutdown
- Liquid damage corrosion
- Short circuits
- Blown fuses & MOSFETs
- Failed voltage regulators
- Capacitor failures
- Battery charging issues
- Keyboard/touchpad failures
- USB/HDMI port repair
- Audio jack repair
- WiFi/Bluetooth issues

**TOOLS & EQUIPMENT:**
- BIOS programmers (CH341A, TL866, RT809F)
- Hot air rework stations
- Soldering stations
- Multimeters & LCR meters
- Oscilloscopes
- Power supplies (bench PSU)
- Ultrasonic cleaners
- Magnification (microscope, magnifying lamps)
- ESD protection
- Flux & solder types

**SOFTWARE TOOLS:**
- BIOS editing tools
- Boardview viewers
- Hex editors
- Firmware extraction tools
- Flash programming software

Be highly technical, precise, and professional. Provide step-by-step diagnostics, voltage measurements, component identification, and repair procedures. Use proper electronics terminology. Current user: ${user.username}`
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [systemMessage, ...messages],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      return NextResponse.json({ 
        error: 'AI service error',
        message: 'Sorry, I encountered an error. Please try again.'
      }, { status: 500 });
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    // Store conversation in database
    await sql`
      INSERT INTO ai_conversations (user_id, messages, created_at)
      VALUES (${user.id}, ${JSON.stringify([...messages, { role: 'assistant', content: aiMessage }])}, NOW())
    `;

    return NextResponse.json({ 
      message: aiMessage,
      success: true 
    });

  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Sorry, something went wrong. Please try again.'
    }, { status: 500 });
  }
}
