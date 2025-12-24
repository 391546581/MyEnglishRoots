import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 示例：常见的 IELTS 高频词汇（部分）
const ieltsWords = [
    'abandon', 'ability', 'able', 'about', 'above', 'abroad', 'absence', 'absolute',
    'absorb', 'abstract', 'abundant', 'abuse', 'academic', 'accept', 'access', 'accident',
    'accompany', 'accomplish', 'according', 'account', 'accurate', 'achieve', 'acknowledge',
    'acquire', 'across', 'action', 'active', 'activity', 'actual', 'adapt', 'addition',
    'address', 'adequate', 'adjust', 'administration', 'admire', 'admit', 'adopt', 'adult',
    'advance', 'advantage', 'adventure', 'advertise', 'advice', 'advise', 'advocate',
    'affect', 'afford', 'afraid', 'after', 'again', 'against', 'agency', 'agenda',
    'agent', 'aggressive', 'agree', 'agriculture', 'ahead', 'aircraft', 'airline',
    'airport', 'alarm', 'album', 'alcohol', 'alert', 'alien', 'alike', 'alive',
    'allocate', 'allow', 'ally', 'almost', 'alone', 'along', 'already', 'also',
    'alter', 'alternative', 'although', 'altogether', 'always', 'amateur', 'amaze',
    'ambition', 'among', 'amount', 'analyse', 'analysis', 'ancient', 'anger', 'angle',
    'animal', 'anniversary', 'announce', 'annual', 'another', 'answer', 'anticipate',
    'anxiety', 'anxious', 'apart', 'apologize', 'apparent', 'appeal', 'appear', 'appetite',
    'applaud', 'application', 'apply', 'appoint', 'appreciate', 'approach', 'appropriate',
    'approve', 'approximate', 'architect', 'architecture', 'area', 'argue', 'argument',
    'arise', 'armed', 'around', 'arrange', 'arrest', 'arrival', 'arrive', 'article',
    'artificial', 'artist', 'artistic', 'aside', 'aspect', 'assemble', 'assert',
    'assess', 'asset', 'assign', 'assist', 'associate', 'assume', 'assure', 'astonish',
    'athlete', 'atmosphere', 'attach', 'attack', 'attain', 'attempt', 'attend', 'attention',
    'attitude', 'attract', 'attribute', 'audience', 'author', 'authority', 'automatic',
    'available', 'average', 'avoid', 'award', 'aware', 'awful'
];

// SAT 高频词汇（部分）
const satWords = [
    'abate', 'aberrant', 'abhor', 'abide', 'abject', 'abridge', 'absolve', 'abstain',
    'abstract', 'abstruse', 'abundant', 'accessible', 'acclaim', 'accolade', 'accommodate',
    'accomplice', 'accord', 'accost', 'accrue', 'acerbic', 'acknowledge', 'acquiesce',
    'acquire', 'acrid', 'acrimonious', 'acumen', 'acute', 'adamant', 'adapt', 'adept',
    'adhere', 'adjacent', 'adjunct', 'admonish', 'adorn', 'adroit', 'adulation',
    'adulterate', 'adversary', 'adverse', 'adversity', 'advocate', 'aesthetic', 'affable',
    'affected', 'affinity', 'affirm', 'afflict', 'affluent', 'aggrandize', 'aggregate',
    'aggressive', 'aggrieved', 'agile', 'agitate', 'alacrity', 'alias', 'alienate',
    'allay', 'allege', 'alleviate', 'allocate', 'allude', 'allure', 'aloof', 'altruistic',
    'amalgamate', 'ambiguous', 'ambivalent', 'ameliorate', 'amenable', 'amiable',
    'amicable', 'amorphous', 'ample', 'amplify', 'anachronism', 'analogous', 'anarchy',
    'anecdote', 'animosity', 'anomaly', 'anonymous', 'antagonist', 'antecedent',
    'antediluvian', 'anthology', 'antipathy', 'antiquated', 'antithesis', 'apathy',
    'apex', 'aphorism', 'aplomb', 'apocalyptic', 'apocryphal', 'appall', 'apparition',
    'appease', 'append', 'application', 'apposite', 'appraise', 'appreciate',
    'apprehensive', 'apprise', 'approbation', 'appropriate', 'approximate', 'apt',
    'aptitude', 'arbitrary', 'arbitrate', 'arcane', 'archaic', 'archetype', 'ardent',
    'arduous', 'aristocratic', 'aromatic', 'arraign', 'array', 'arrogant', 'articulate',
    'artifact', 'artifice', 'artisan', 'ascendancy', 'ascertain', 'ascetic', 'ascribe',
    'askew', 'aspire', 'assail', 'assent', 'assert', 'assess', 'assiduous', 'assimilate',
    'assuage', 'assume', 'assurance', 'astute', 'asylum', 'atone', 'atrocity', 'attain',
    'attenuate', 'attest', 'attribute', 'atypical', 'audacious', 'augment', 'august',
    'auspicious', 'austere', 'authentic', 'authoritarian', 'autocratic', 'autonomous',
    'avarice', 'avenge', 'aver', 'averse', 'avert', 'avid', 'avow', 'awry', 'axiom'
];

// GRE 高频词汇（部分）
const greWords = [
    'abate', 'aberrant', 'abeyance', 'abscond', 'abstemious', 'admonish', 'adulterate',
    'aesthetic', 'aggregate', 'alacrity', 'alleviate', 'amalgamate', 'ambiguous',
    'ameliorate', 'anachronism', 'analogous', 'anarchy', 'anomalous', 'antipathy',
    'apathy', 'appease', 'approbation', 'appropriate', 'arduous', 'artless', 'ascetic',
    'assiduous', 'assuage', 'attenuate', 'audacious', 'austere', 'autonomous', 'avarice',
    'axiomatic', 'banal', 'belie', 'beneficent', 'bolster', 'bombastic', 'boorish',
    'burgeon', 'burnish', 'buttress', 'capricious', 'castigation', 'catalyst', 'caustic',
    'chicanery', 'coagulate', 'coda', 'cogent', 'commensurate', 'compendium',
    'complaisant', 'compliant', 'conciliatory', 'condone', 'confound', 'connoisseur',
    'contention', 'contentious', 'contrite', 'conundrum', 'converge', 'convoluted',
    'copious', 'corroborate', 'cosmopolitan', 'covet', 'craftiness', 'credulous',
    'culpable', 'cynicism', 'daunt', 'decorum', 'default', 'deference', 'delineate',
    'denigrate', 'deride', 'derivative', 'desiccate', 'desultory', 'deterrent',
    'detrimental', 'diatribe', 'didactic', 'diffident', 'digression', 'dilate',
    'dilatory', 'diligent', 'dirge', 'disabuse', 'discerning', 'discomfit', 'discordant',
    'discredit', 'discrepancy', 'discrete', 'discretion', 'disingenuous', 'disinterested',
    'disjointed', 'dismiss', 'disparage', 'disparate', 'dissemble', 'disseminate',
    'dissolution', 'dissonance', 'distend', 'distill', 'diverge', 'divest', 'divulge',
    'dogmatic', 'dormant', 'dupe', 'ebullient', 'eccentric', 'eclectic', 'efficacy',
    'effrontery', 'elegy', 'elicit', 'eloquence', 'elucidate', 'elusive', 'embellish',
    'empirical', 'emulate', 'endemic', 'enervate', 'engender', 'enigma', 'enmity',
    'enumerate', 'ephemeral', 'equanimity', 'equivocate', 'eradicate', 'erratic',
    'erudite', 'esoteric', 'espouse', 'eulogy', 'euphemism', 'evanescent', 'exacerbate',
    'exacting', 'exculpate', 'execrate', 'exemplary', 'exhaustive', 'exhort', 'exigent',
    'exonerate', 'exorbitant', 'expedient', 'explicit', 'extant', 'extol', 'extraneous',
    'extrapolation', 'facetious', 'facilitate', 'fallacious', 'fastidious', 'fatuous',
    'fawning', 'felicitous', 'fervent', 'fervid', 'flagrant', 'fledgling', 'flout',
    'foment', 'forestall', 'fortuitous', 'foster', 'founder', 'frugal', 'furtive',
    'gainsay', 'garrulous', 'gauche', 'germane', 'glib', 'gregarious', 'guileless',
    'gullible', 'hackneyed', 'halcyon', 'harangue', 'hardy', 'hasten', 'haughty',
    'hedonist', 'hegemony', 'heresy', 'heterodox', 'homogeneous', 'hubris', 'hyperbole',
    'iconoclast', 'idiosyncrasy', 'ignoble', 'ignominy', 'illicit', 'immutable',
    'impair', 'impartial', 'impecunious', 'impediment', 'impermeable', 'imperturbable',
    'impervious', 'impetuous', 'impinge', 'implacable', 'implausible', 'implement',
    'implicate', 'implicit', 'imply', 'importune', 'impoverish', 'impregnable',
    'impromptu', 'improvident', 'imprudent', 'impudent', 'impugn', 'impute', 'inadvertent',
    'inane', 'inaugurate', 'incense', 'incessant', 'inchoate', 'incipient', 'incisive',
    'inclination', 'incongruous', 'inconsequential', 'incorporate', 'incorrigible',
    'incredulous', 'inculcate', 'incumbent', 'indefatigable', 'indelible', 'indeterminate',
    'indigence', 'indigenous', 'indigent', 'indignant', 'indolent', 'indomitable',
    'induce', 'indulgent', 'ineffable', 'inept', 'inert', 'inevitable', 'inexorable',
    'infer', 'ingenious', 'ingenuous', 'inherent', 'inhibit', 'inimical', 'iniquity',
    'injunction', 'innate', 'innocuous', 'innovate', 'innuendo', 'inordinate', 'inscrutable',
    'insensible', 'insinuate', 'insipid', 'insolent', 'instigate', 'insular', 'insuperable',
    'insurgent', 'intact', 'intangible', 'integral', 'integrity', 'intemperate',
    'inter', 'interdict', 'interim', 'interject', 'interlocutor', 'interloper',
    'intermittent', 'interpolate', 'interpose', 'intervene', 'intimate', 'intractable',
    'intransigent', 'intrepid', 'intricate', 'intrinsic', 'introspective', 'introvert',
    'intrude', 'intuition', 'inundate', 'inured', 'invective', 'inveigh', 'inveigle',
    'inverse', 'invert', 'inveterate', 'invidious', 'invigorate', 'invincible',
    'inviolable', 'invoke', 'iota', 'irascible', 'irate', 'ire', 'irksome', 'irrelevant',
    'irreproachable', 'irresolute', 'irrevocable', 'itinerant', 'itinerary'
];

async function updateWordLevels() {
    console.log('开始更新词汇等级...\n');

    try {
        // 更新 IELTS 词汇
        console.log(`正在更新 ${ieltsWords.length} 个 IELTS 词汇...`);
        const ieltsResult = await prisma.word.updateMany({
            where: {
                text: { in: ieltsWords },
                level: 'N/A' // 只更新未标记的词
            },
            data: { level: 'IELTS' }
        });
        console.log(`✓ 已更新 ${ieltsResult.count} 个 IELTS 词汇\n`);

        // 更新 SAT 词汇
        console.log(`正在更新 ${satWords.length} 个 SAT 词汇...`);
        const satResult = await prisma.word.updateMany({
            where: {
                text: { in: satWords },
                level: 'N/A'
            },
            data: { level: 'SAT' }
        });
        console.log(`✓ 已更新 ${satResult.count} 个 SAT 词汇\n`);

        // 更新 GRE 词汇
        console.log(`正在更新 ${greWords.length} 个 GRE 词汇...`);
        const greResult = await prisma.word.updateMany({
            where: {
                text: { in: greWords },
                level: 'N/A'
            },
            data: { level: 'GRE' }
        });
        console.log(`✓ 已更新 ${greResult.count} 个 GRE 词汇\n`);

        // 统计信息
        const stats = await prisma.word.groupBy({
            by: ['level'],
            _count: true
        });

        console.log('📊 当前词汇等级分布：');
        stats.forEach(stat => {
            console.log(`  ${stat.level}: ${stat._count} 个单词`);
        });

        console.log('\n✅ 词汇等级更新完成！');
    } catch (error) {
        console.error('❌ 更新失败:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateWordLevels();
