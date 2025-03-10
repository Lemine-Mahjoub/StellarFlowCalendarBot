import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';

const ASSETS_DIR = path.join(process.cwd(), 'src', 'assets');

const getExtensionFromMimeType = (contentType) => {
    const mimeToExt = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp'
    };
    return mimeToExt[contentType] || 'jpg';
};

export const saveImage = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch image');

        const contentType = response.headers.get('content-type');
        if (!contentType?.startsWith('image/')) {
            throw new Error('Le fichier n\'est pas une image');
        }

        const buffer = Buffer.from(await response.arrayBuffer());
        const extension = getExtensionFromMimeType(contentType);
        const fileName = `${uuidv4()}.${extension}`;
        const filePath = path.join(ASSETS_DIR, fileName);

        // Vérifier si le dossier assets existe, sinon le créer
        try {
            await fs.access(ASSETS_DIR);
        } catch {
            await fs.mkdir(ASSETS_DIR, { recursive: true });
        }

        await fs.writeFile(filePath, buffer);
        console.log(`Image sauvegardée: ${fileName}`);
        return fileName;
    } catch (error) {
        console.error('Error saving image:', error);
        return null;
    }
};

export const deleteImage = async (fileName) => {
    try {
        if (!fileName) return;
        const filePath = path.join(ASSETS_DIR, fileName);
        await fs.access(filePath); // Vérifie si le fichier existe
        await fs.unlink(filePath);
        console.log(`Image supprimée: ${fileName}`);
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'image:', error);
    }
};