import pool from "@/lib/db";
import {cookies} from "next/headers";
import crypto from "crypto";

export async function createSession(userId: number){
    const sessionId = crypto.randomUUID();
    
    await pool.query(
        'INSERT INTO sessions (id, user_id) VALUES ($1, $2, NOW() + INTERVAL \'7 days\')',
        [sessionId, userId]
    );
    const cookeStore = await cookies();
    cookeStore.set('session_id', sessionId, {
        httpOnly: true,
        secure: false,
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    })
    return sessionId;
}

export async function getSession() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    if (!sessionId) return null;

    const result = await pool.query(
        `SELECT s.id, s.user_id, s.expires_at, u.name, u.email, u.role FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = $1 AND s.expires_at > NOW() AND u.is_deleted = false AND u.is_active = true`,
        [sessionId]
    );

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
}

export async function deleteSession() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    if (!sessionId){
        await pool.query(
            'DELETE FROM sessions WHERE id = $1',
            [sessionId]
        );
        cookieStore.delete('session_id');
    }
}