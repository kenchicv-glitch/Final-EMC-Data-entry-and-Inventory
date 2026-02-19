import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { google } from "googleapis";

// Define CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // formatting
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { type, record, old_record, table, schema } = await req.json();

        // Only process changes from 'inventory_items' or 'stock_movements' tables
        // (You can also filter by 'INSERT', 'UPDATE', 'DELETE')

        // Retrieve Secrets
        const serviceAccountJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT');
        const sheetId = Deno.env.get('SHEET_ID');

        if (!serviceAccountJson || !sheetId) {
            throw new Error("Missing GOOGLE_SERVICE_ACCOUNT or SHEET_ID secrets");
        }

        const credentials = JSON.parse(serviceAccountJson);

        // Authenticate with Google
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        // Determine Sheet name/tab based on table name
        const sheetName = table === 'inventory_items' ? 'Inventory' : 'Movements'; // Ensure tabs exist!

        // Format data for appending
        let values = [];

        if (table === 'inventory_items') {
            // Row format: ID, Name, Category, Stock, Min Stock, Updated At
            values = [[
                record.id,
                record.name,
                record.category,
                record.current_stock,
                record.min_stock_level,
                new Date().toISOString()
            ]];
        } else if (table === 'stock_movements') {
            // Row format: ID, Item ID, Type, Quantity, Date, Created By
            values = [[
                record.id,
                record.item_id,
                record.type,
                record.quantity,
                record.movement_date,
                record.created_by,
            ]];
        }

        if (values.length > 0) {
            // Append to Sheet
            await sheets.spreadsheets.values.append({
                spreadsheetId: sheetId,
                range: `${sheetName}!A:Z`, // Append to end
                valueInputOption: 'USER_ENTERED',
                requestBody: { values },
            });
        }

        return new Response(JSON.stringify({ message: "Synced to Sheets" }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
