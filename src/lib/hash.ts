import bcrypt from 'bcryptjs';

export async function hashPassword(password: string){
    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(password, salt);

    return hashedPassword
};

export async function comparePassword(password:string, hash: string){
    return await bcrypt.compare(password, hash)
}