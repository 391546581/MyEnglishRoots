import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

// 数据源 URL
const SOURCES = {
    IELTS: 'https://raw.githubusercontent.com/ladrift/toefl/master/words/wangyumei-toefl-words.txt', // 借用王玉梅托福词汇作为示例，实际可替换为纯雅思词库
    TOEFL: 'https://raw.githubusercontent.com/ladrift/toefl/master/words/wangyumei-toefl-words.txt'
};

async function fetchWordList(url: string): Promise<string[]> {
    try {
        const response = await axios.get(url);
        const content = response.data as string;
        // 针对 wangyumei-toefl-words.txt 的格式解析：word#definition
        const words = content.split('\n')
            .map(line => line.split('#')[0].trim())
            .filter(word => word && /^[a-zA-Z-]+$/.test(word));
        return Array.from(new Set(words));
    } catch (error) {
        console.error(`无法获取词库: ${url}`, error);
        return [];
    }
}

async function updateAllLevels() {
    console.log('🚀 开始从远程仓库更新词汇分类...');

    try {
        // 1. 获取并更新 TOEFL (作为基准)
        console.log('📡 正在从 GitHub 获取 TOEFL 词库...');
        const toeflWords = await fetchWordList(SOURCES.TOEFL);
        console.log(`📦 获取到 ${toeflWords.length} 个单词`);

        if (toeflWords.length > 0) {
            const result = await prisma.word.updateMany({
                where: {
                    text: { in: toeflWords.map(w => w.toLowerCase()) },
                    level: 'N/A'
                },
                data: { level: 'TOEFL' }
            });
            console.log(`✅ 已标注 ${result.count} 个单词为 TOEFL`);
        }

        // 2. 统计信息
        const stats = await prisma.word.groupBy({
            by: ['level'],
            _count: true
        });

        console.log('\n📊 当前数据库词汇分布：');
        stats.forEach(stat => {
            console.log(`  - ${stat.level}: ${stat._count} 个`);
        });

    } catch (error) {
        console.error('❌ 更新过程出错:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateAllLevels();

// 运行 npx tsx scripts/sync-word-levels.ts 执行脚本更新
