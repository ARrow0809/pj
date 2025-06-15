
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.error("API_KEY is not set. Please ensure the API_KEY environment variable is configured.");
    const promptOutputEn = document.getElementById('prompt-output-en') as HTMLTextAreaElement;
    if (promptOutputEn) {
        promptOutputEn.value = "エラー: APIキーが設定されていません。アプリケーションを正しく動作させるためには設定が必要です。";
    }
}
const ai = new GoogleGenAI({ apiKey: API_KEY! });

interface SelectElements {
    [key: string]: HTMLSelectElement | null;
}

interface TemplateData {
    freeText: string;
    settings: { [key: string]: string };
}

interface Templates {
    [key: string]: TemplateData;
}

// Types for All-in-One data
interface AllInOneTagItem {
  ja: string;
  en: string;
}
interface AllInOneSubCategory {
  [subCategoryName: string]: AllInOneTagItem[];
}
interface AllInOneParsedData {
  [mainCategoryName: string]: AllInOneSubCategory;
}

interface SelectedAioTag {
    en: string;
    ja: string;
    mainCategory: string;
}


const templates: Templates = {
    "ギャル系": {
        freeText: "明るい茶髪か金髪のロング巻き髪、エクステも使用。ぱっちりとしたデカ目メイク、つけまつげとカラコンは必須。ネイルは長く派手なデザイン。ファッションはミニスカートやショートパンツ、オフショルダーなど露出度高めで、厚底ブーツやサンダルを合わせる。自信に満ちた少し強気な表情で、渋谷や原宿の雑踏が背景。",
        settings: { 'style-select': 'Photograph style', 'hair-color': 'Blonde hair', 'hairstyle': 'Long layered hair', 'clothing-style': 'Casual wear', 'facial-expression': 'Smiling face', 'background-setting': 'Cityscape background', 'age-group': 'Late teens' }
    },
    "アダルト系": {
        freeText: "落ち着いた色合いの服装、上質な素材感。シンプルながらも洗練されたデザインのドレスやスーツスタイル。髪型はまとめ髪や上品なボブ。メイクはナチュラルだが、目元や口元にポイント。知的で穏やかな、あるいは少しミステリアスな表情。高級ホテルのラウンジや夜景の見えるバーが似合う。",
        settings: { 'style-select': 'Photograph style', 'age-group': 'Late 30s', 'hairstyle': 'Upstyle', 'clothing-style': 'Formal wear', 'clothing-color': 'Black clothing', 'facial-expression': 'Serious face', 'background-setting': 'Indoor room background', 'lighting-conditions': 'Low-key lighting' }
    },
    "女子高生系": {
        freeText: "ブレザーやセーラー服などの制服姿。髪型は黒髪のストレートやツインテール。メイクはほぼすっぴんに近いナチュラルメイク。元気で明るい笑顔、または少しはにかんだ表情。学校の教室、廊下、校庭、通学路などが背景。",
        settings: { 'style-select': 'Photograph style', 'age-group': 'Late teens', 'hairstyle': 'Long straight hair', 'hair-color': 'Black hair', 'clothing-style': 'School uniform', 'facial-expression': 'Smiling face', 'background-setting': 'School background', 'time-of-day': 'Daytime' }
    },
    "地雷系": {
        freeText: "黒を基調としたファッションにピンクや白の差し色。フリルやレース、リボンを多用した病みかわいいスタイル。ツインテールやお団子ヘアに大きなリボン。泣きそうなうるんだ瞳、または虚ろな表情。包帯や眼帯などの小物も。薄暗い部屋やネオン街の路地裏が雰囲気。",
        settings: { 'style-select': 'Illustration style', 'age-group': 'Late teens', 'hairstyle': 'Twintails', 'hair-color': 'Black hair', 'clothing-style': 'Gothic lolita', 'clothing-color': 'Black clothing', 'facial-expression': 'Sad face', 'overall-atmosphere': 'Dark atmosphere' }
    },
    "清楚系": {
        freeText: "白やパステルカラーを基調とした上品な服装。ワンピースやブラウスにスカートなど、清潔感のあるスタイル。髪は黒髪か暗めの茶髪で、ストレートか緩いウェーブ。メイクはナチュラルで透明感重視。優しく穏やかな微笑み。図書館や公園、日当たりの良いカフェなどが似合う。",
        settings: { 'style-select': 'Photograph style', 'age-group': 'Early 20s', 'hairstyle': 'Long straight hair', 'hair-color': 'Black hair', 'clothing-style': 'Casual wear', 'clothing-color': 'White clothing', 'facial-expression': 'Smiling face', 'overall-atmosphere': 'Bright atmosphere' }
    },
    "ストリート系": {
        freeText: "オーバーサイズのパーカーやTシャツ、ダメージジーンズやカーゴパンツ。スニーカーやキャップ、バックパックが定番アイテム。髪色は自由で、ショートカットやブレイズなども。クールで少し無気力な表情、または楽しそうな自然体の笑顔。都市のスケートパークやグラフィティアートのある壁の前。",
        settings: { 'style-select': 'Photograph style', 'age-group': 'Early 20s', 'hairstyle': 'Short cut', 'clothing-style': 'Casual wear', 'shoes': 'Sneakers', 'facial-expression': 'Neutral expression', 'background-setting': 'Cityscape background'}
    },
    "森ガール系": {
        freeText: "アースカラーや生成り色のゆったりとした重ね着スタイル。コットンやリネンなどの自然素材の服。Aラインのワンピースやロングスカート、レースや刺繍のディテール。髪はゆるく編んだり、無造作なダウンスタイル。手には古書やドライフラワー。優しく儚げな表情。緑豊かな森の中や古いコテージが背景。",
        settings: { 'style-select': 'Photograph style', 'age-group': 'Early 20s', 'hairstyle': 'Medium wave hair', 'clothing-style': 'Casual wear', 'clothing-color': 'Beige clothing', 'facial-expression': 'Peaceful atmosphere', 'background-setting': 'Forest setting' }
    },
    "メスガキ系": {
        freeText: "小悪魔的で生意気な表情、挑発的な上目遣い。ツインテールや小柄な体型を強調する服装。少し見下したような、あるいはからかうような態度。背景は学校の廊下や教室、あるいはシンプルな単色背景でキャラクターを際立たせる。",
        settings: { 'style-select': 'Illustration style', 'age-group': 'Late teens', 'hairstyle': 'Twintails', 'facial-expression': 'Smirking face', 'clothing-style': 'School uniform'}
    },
    "ゴシック系": {
        freeText: "黒や深紅、濃紫を基調とした退廃的で幻想的なスタイル。ベルベット、レース、レザー素材。コルセット、ロングドレス、十字架や薔薇のモチーフのアクセサリー。表情はミステリアスで物憂げ、あるいは力強い意志を感じさせる。背景は古城、廃墟、霧のかかった森、ステンドグラスのある教会など。",
        settings: { 'style-select': 'Illustration style', 'clothing-style': 'Gothic lolita', 'clothing-color': 'Black clothing', 'overall-atmosphere': 'Dark atmosphere', 'facial-expression': 'Serious face', 'background-setting': 'Ruins background' }
    },
    "ぽっちゃり系": {
        freeText: "健康的で魅力的なふっくらとした体型。柔らかさを感じる曲線美。ファッションは体型を隠さず、むしろ活かすようなスタイル。例えば、少しゆったりめのニットや、ウエストをマークしたワンピースなど。明るく親しみやすい笑顔、または自信に満ちた表情。背景は日常的なシーン、例えばカフェや公園、部屋の中など。plump body, chubby, soft curves",
        settings: { 'style-select': 'Photograph style', 'age-group': 'Early 20s', 'clothing-style': 'Casual wear', 'facial-expression': 'Smiling face' }
    }
};

const photographicStyles = [
    "Photograph style", "Instax polaroid style", "Disposable camera film style",
    "DSLR camera photo style", "Leica M10 photo style"
];

let allInOneParsedDataGlobal: AllInOneParsedData | null = null;
const allInOneSelectedTagsGlobal: SelectedAioTag[] = [];
let draggedTagPill: HTMLElement | null = null;


function parseAllInOneData(text: string): AllInOneParsedData {
    const data: AllInOneParsedData = {};
    let currentMainCategory: string | null = null;
    let currentSubCategory: string | null = null;
    let mainCategoryObject: AllInOneSubCategory | null = null;
    let subCategoryArray: AllInOneTagItem[] | null = null;

    const lines = text.split('\n');

    for (const line of lines) {
        const trimmedLineStart = line.trimStart(); 
        if (trimmedLineStart.length === 0 || trimmedLineStart.startsWith('#')) continue; 

        const mainCategoryMatch = line.match(/^([^\s#][^:]*[^:\s]):\s*$/);
        const itemMatch = line.match(/^\s\s\s\s-\s*(.+?):\s*([a-zA-Z0-9_().#\-\s]+?)(?:\s*#.*)?$/);
        const subCategoryMatch = line.match(/^\s\s([^\s#][^:]*[^:\s]):\s*$/);


        if (mainCategoryMatch) {
            currentMainCategory = mainCategoryMatch[1].trim();
            currentSubCategory = null;
            data[currentMainCategory] = {};
            mainCategoryObject = data[currentMainCategory];
            subCategoryArray = null;
        } else if (subCategoryMatch && mainCategoryObject && currentMainCategory) {
            currentSubCategory = subCategoryMatch[1].trim();
            mainCategoryObject[currentSubCategory] = [];
            subCategoryArray = mainCategoryObject[currentSubCategory];
        } else if (itemMatch && mainCategoryObject && currentSubCategory && subCategoryArray) {
            const jaLabel = itemMatch[1].trim();
            let enTag = itemMatch[2].trim();
             const commentIndex = enTag.indexOf('#');
             if (commentIndex !== -1) {
                 enTag = enTag.substring(0, commentIndex).trim();
             }

            if (jaLabel && enTag) {
                subCategoryArray.push({ ja: jaLabel, en: enTag });
            }
        }
    }
    return data;
}

function renderSelectedTagPills() {
    const container = document.getElementById('all-in-one-selected-tags-container');
    if (!container) return;
    container.innerHTML = ''; 

    allInOneSelectedTagsGlobal.forEach((tagObj, index) => {
        const pill = document.createElement('div');
        pill.className = 'all-in-one-tag-pill';
        pill.textContent = tagObj.en; 
        pill.draggable = true;
        pill.dataset.tag = tagObj.en; 
        pill.dataset.index = String(index);
        pill.classList.add(`pill-maincat-${tagObj.mainCategory.replace(/[\\s/]+/g, '-').toLowerCase()}`);


        const deleteButton = document.createElement('button');
        deleteButton.className = 'all-in-one-tag-pill-delete';
        deleteButton.innerHTML = '&times;';
        deleteButton.setAttribute('aria-label', `Remove ${tagObj.en}`);
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation(); 
            allInOneSelectedTagsGlobal.splice(index, 1);
            updateMainTagButtonSelection(tagObj.en, false);
            renderSelectedTagPills();
            renderCombinedJapaneseTranslation();
            updateAllInOneTokenCounter();
        });

        pill.appendChild(deleteButton);
        container.appendChild(pill);

        pill.addEventListener('dragstart', (e) => {
            draggedTagPill = e.target as HTMLElement;
            draggedTagPill.classList.add('dragging');
            if (e.dataTransfer) {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', tagObj.en); 
            }
        });

        pill.addEventListener('dragend', () => {
            draggedTagPill?.classList.remove('dragging');
            draggedTagPill = null;
        });
    });
}

function renderCombinedJapaneseTranslation() {
    const jaContainer = document.getElementById('all-in-one-selected-tags-japanese');
    if (jaContainer) {
        jaContainer.textContent = allInOneSelectedTagsGlobal.map(tagObj => tagObj.ja).join(', ');
    }
}


function updateMainTagButtonSelection(enTag: string, isSelected: boolean) {
    const mainTagButton = document.querySelector(`#all-in-one-dynamic-content-area .tag-item-button[data-tag-en="${CSS.escape(enTag)}"]`) as HTMLButtonElement;
    if (mainTagButton) {
        if (isSelected) {
            mainTagButton.classList.add('selected');
        } else {
            mainTagButton.classList.remove('selected');
        }
    }
}


function renderAllInOneTabContent() {
    const container = document.getElementById('all-in-one-dynamic-content-area');
    const loadingMessage = document.getElementById('all-in-one-loading-message');
    if (!container || !loadingMessage) return;

    if (!allInOneParsedDataGlobal) {
        loadingMessage.style.display = 'block';
        container.innerHTML = ''; 
        // container.appendChild(loadingMessage); // Already in HTML, just control display
        return;
    }
    if (Object.keys(allInOneParsedDataGlobal).length === 0 && loadingMessage.textContent !== "タグデータの読み込みに失敗しました。") {
        loadingMessage.textContent = "表示できるタグがありません。データを確認してください。";
        loadingMessage.style.display = 'block';
        container.innerHTML = '';
        return;
    }

    loadingMessage.style.display = 'none';
    container.innerHTML = ''; 

    for (const mainCategoryName in allInOneParsedDataGlobal) {
        const mainCategorySection = document.createElement('section');
        mainCategorySection.className = 'main-category-section';
        
        const mainTitle = document.createElement('h3');
        mainTitle.className = 'main-category-title';
        mainTitle.textContent = mainCategoryName;
        mainCategorySection.appendChild(mainTitle);
        
        const subCategories = allInOneParsedDataGlobal[mainCategoryName];
        let hasVisibleTagsInMain = false;

        for (const subCategoryName in subCategories) {
            const details = document.createElement('details');
            const summary = document.createElement('summary');
            summary.textContent = subCategoryName;
            
            const tagsContainer = document.createElement('div');
            tagsContainer.className = 'tags-container';
            
            let hasVisibleTagsInSub = false;
            const items = subCategories[subCategoryName];
            items.forEach(item => {
                const button = document.createElement('button');
                button.className = 'tag-item-button';
                button.classList.add(`tag-button-maincat-${mainCategoryName.replace(/[\\s/]+/g, '-').toLowerCase()}`);
                button.textContent = item.ja; 
                button.title = item.en;     
                button.dataset.tagEn = item.en; 
                button.dataset.tagJa = item.ja;
                button.dataset.mainCategory = mainCategoryName;

                if (allInOneSelectedTagsGlobal.some(tagObj => tagObj.en === item.en)) {
                    button.classList.add('selected');
                }
                button.addEventListener('click', () => handleAllInOneTagClick(item.en, item.ja, mainCategoryName));
                tagsContainer.appendChild(button);
                hasVisibleTagsInSub = true;
                hasVisibleTagsInMain = true;
            });

            if (hasVisibleTagsInSub) {
                details.appendChild(summary);
                details.appendChild(tagsContainer);
                mainCategorySection.appendChild(details);
            }
        }
        if(hasVisibleTagsInMain) {
            container.appendChild(mainCategorySection);
        } else {
             mainCategorySection.remove(); 
        }
    }
    renderSelectedTagPills(); 
    renderCombinedJapaneseTranslation();
    updateAllInOneTokenCounter();
}

function updateAllInOneTokenCounter() {
    const tokenCounter = document.getElementById('all-in-one-token-counter');
    if (tokenCounter) {
        const promptString = allInOneSelectedTagsGlobal.map(tagObj => tagObj.en).join(', ');
        const totalChars = promptString.length; 
        let charsForDisplay = totalChars % 75;
        if (charsForDisplay === 0 && totalChars > 0) {
            charsForDisplay = 75;
        }
        if (totalChars === 0) {
            charsForDisplay = 0;
        }
        tokenCounter.textContent = `Token (${charsForDisplay}/75)`;
    }
}

function handleAllInOneTagClick(enTag: string, jaTag: string, mainCategory: string) {
    const index = allInOneSelectedTagsGlobal.findIndex(tagObj => tagObj.en === enTag);
    if (index > -1) {
        allInOneSelectedTagsGlobal.splice(index, 1);
        updateMainTagButtonSelection(enTag, false);
    } else {
        allInOneSelectedTagsGlobal.push({ en: enTag, ja: jaTag, mainCategory: mainCategory });
        updateMainTagButtonSelection(enTag, true);
    }
    renderSelectedTagPills();
    renderCombinedJapaneseTranslation();
    updateAllInOneTokenCounter();
}


document.addEventListener('DOMContentLoaded', async () => {
    const mainTabsNav = document.getElementById('main-tabs-nav');
    const mainTabButtons = mainTabsNav?.querySelectorAll<HTMLButtonElement>('.tab-button');
    const tabContents = document.querySelectorAll<HTMLElement>('.tab-content');

    const outputTabsNav = document.getElementById('output-tabs-nav');
    const outputTabButtons = outputTabsNav?.querySelectorAll<HTMLButtonElement>('.output-tab-button:not(#yaml-code-button)');
    const yamlCodeButton = document.getElementById('yaml-code-button') as HTMLButtonElement;

    const generatePromptButton = document.getElementById('generate-prompt-button') as HTMLButtonElement;
    const resetButton = document.getElementById('reset-button') as HTMLButtonElement;
    const randomButton = document.getElementById('random-button') as HTMLButtonElement;
    const copyPromptButton = document.getElementById('copy-prompt-button') as HTMLButtonElement;
    
    const promptOutputEnTextarea = document.getElementById('prompt-output-en') as HTMLTextAreaElement;
    const promptOutputJaTextarea = document.getElementById('prompt-output-ja') as HTMLTextAreaElement;
    const freeTextPromptTextarea = document.getElementById('free-text-prompt') as HTMLTextAreaElement;
    
    const templateButtonsContainer = document.getElementById('template-buttons-container');
    
    const imageFileInput = document.getElementById('image-file-input') as HTMLInputElement;
    const loadImageAndDeconstructButton = document.getElementById('load-image-and-deconstruct-button') as HTMLButtonElement;
    const promptToConvertInputTextarea = document.getElementById('prompt-to-convert-input') as HTMLTextAreaElement;
    const executeTextConversionButton = document.getElementById('execute-text-conversion-button') as HTMLButtonElement;

    const copyAllInOneToFreeTextButton = document.getElementById('copy-all-in-one-to-free-text') as HTMLButtonElement;
    const allInOneRandomButton = document.getElementById('all-in-one-random-button') as HTMLButtonElement;
    const allInOneResetButton = document.getElementById('all-in-one-reset-button') as HTMLButtonElement;
    const selectedTagsContainer = document.getElementById('all-in-one-selected-tags-container');

    selectedTagsContainer?.addEventListener('dragover', (e) => {
        e.preventDefault(); 
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    });

    selectedTagsContainer?.addEventListener('drop', (e) => {
        e.preventDefault();
        if (!draggedTagPill || !selectedTagsContainer) return;
    
        const targetPill = (e.target as HTMLElement).closest('.all-in-one-tag-pill');
        const draggedTagEn = draggedTagPill.dataset.tag;
        if (!draggedTagEn) return;
    
        const fromIndex = allInOneSelectedTagsGlobal.findIndex(t => t.en === draggedTagEn);
        if (fromIndex === -1) return; 
    
        const [draggedItem] = allInOneSelectedTagsGlobal.splice(fromIndex, 1); 
    
        if (targetPill && targetPill !== draggedTagPill) {
            const childrenArray = Array.from(selectedTagsContainer.children);
            const toIndex = childrenArray.indexOf(targetPill);
            allInOneSelectedTagsGlobal.splice(toIndex, 0, draggedItem);
        } else {
            // If not dropping on another pill, determine position based on X coordinate
             const dropX = e.clientX;
             const children = Array.from(selectedTagsContainer.children) as HTMLElement[];
             let insertAtIndex = children.length; 
     
             for (let i = 0; i < children.length; i++) {
                 const childRect = children[i].getBoundingClientRect();
                 if (dropX < childRect.left + childRect.width / 2) {
                     insertAtIndex = i;
                     break;
                 }
             }
             // Adjust insertAtIndex if the dragged pill was originally before the drop target
             const originalDraggedIndexInView = children.indexOf(draggedTagPill);
             if (originalDraggedIndexInView !== -1 && originalDraggedIndexInView < insertAtIndex) {
                allInOneSelectedTagsGlobal.splice(insertAtIndex -1, 0, draggedItem);
             } else {
                allInOneSelectedTagsGlobal.splice(insertAtIndex, 0, draggedItem);
             }
        }
    
        draggedTagPill.classList.remove('dragging');
        draggedTagPill = null;
        renderSelectedTagPills();
        renderCombinedJapaneseTranslation();
        updateAllInOneTokenCounter();
    });


    const allSelectIds = [
        'style-select', 
        'ethnicity', 'age-group', 'hairstyle', 'hair-color', 'clothing-style',
        'clothing-color', 'clothing-pattern', 'pose', 'facial-expression', 'shoes',
        'lighting-conditions', 'color-grading', 'composition', 'background-setting',
        'time-of-day', 'overall-atmosphere', 'season',
        'rendering-quality', 'aspect-ratio'
    ];

    const selectElements: SelectElements = {};
    allSelectIds.forEach(id => {
        selectElements[id] = document.getElementById(id) as HTMLSelectElement;
    });

    try {
        const response = await fetch('all-in-one-data.txt');
        if (!response.ok) {
            throw new Error(`Failed to fetch all-in-one-data.txt: ${response.statusText} (status: ${response.status})`);
        }
        const text = await response.text();
        
        let yamlContentToParse = "";
        const yamlBlockRegex = /```yaml\s*([\s\S]*?)\s*```/g;
        let match;
        let foundBlock = false;
        while ((match = yamlBlockRegex.exec(text)) !== null) {
            yamlContentToParse += match[1] + "\n";
            foundBlock = true;
        }

        if (!foundBlock && text.trim() !== "") {
            // If no ```yaml blocks were found, but the file has content,
            // assume the entire file content is the YAML data.
            yamlContentToParse = text;
        }
        
        yamlContentToParse = yamlContentToParse.trim();

        if (yamlContentToParse === "") {
             console.warn("Fetched all-in-one-data.txt was empty or contained no parsable YAML content.");
             allInOneParsedDataGlobal = {}; 
        } else {
            allInOneParsedDataGlobal = parseAllInOneData(yamlContentToParse);
        }
        renderAllInOneTabContent(); 
    } catch (error) {
        console.error("Error loading or parsing All-in-One data:", error);
        const loadingMessage = document.getElementById('all-in-one-loading-message');
        if (loadingMessage) {
            loadingMessage.textContent = "タグデータの読み込みに失敗しました。";
            // Ensure it's visible if it was hidden
            loadingMessage.style.display = 'block'; 
            const dynamicContentArea = document.getElementById('all-in-one-dynamic-content-area');
            if (dynamicContentArea) dynamicContentArea.innerHTML = ''; // Clear any potentially half-rendered content
            dynamicContentArea?.appendChild(loadingMessage); // Re-add if cleared
        }
    }
    
    copyAllInOneToFreeTextButton?.addEventListener('click', () => {
        const allInOnePromptString = allInOneSelectedTagsGlobal.map(tagObj => tagObj.en).join(', ');
        if (freeTextPromptTextarea) {
            if (freeTextPromptTextarea.value.trim() !== "" && allInOnePromptString.trim() !== "") {
                 freeTextPromptTextarea.value += (", " + allInOnePromptString);
            } else {
                 freeTextPromptTextarea.value = allInOnePromptString;
            }
        }
    });

    allInOneResetButton?.addEventListener('click', () => {
        allInOneSelectedTagsGlobal.length = 0;
        renderSelectedTagPills();
        renderCombinedJapaneseTranslation();
        updateAllInOneTokenCounter();
        const tagButtons = document.querySelectorAll('#all-in-one-dynamic-content-area .tag-item-button');
        tagButtons.forEach(btn => btn.classList.remove('selected'));
    });

    allInOneRandomButton?.addEventListener('click', () => {
        if (!allInOneParsedDataGlobal) {
            console.warn("All-in-One data not loaded, cannot perform random selection.");
            return;
        }
        allInOneSelectedTagsGlobal.length = 0; // Clear current selections
    
        const newlySelectedTags: SelectedAioTag[] = [];
        const mainCategories = Object.keys(allInOneParsedDataGlobal);
    
        for (const mainCategoryName of mainCategories) {
            const subCategories = allInOneParsedDataGlobal[mainCategoryName];
            const allItemsInMainCategory: AllInOneTagItem[] = [];
    
            for (const subCategoryName in subCategories) {
                allItemsInMainCategory.push(...subCategories[subCategoryName]);
            }
    
            if (allItemsInMainCategory.length > 0) {
                const randomIndex = Math.floor(Math.random() * allItemsInMainCategory.length);
                const randomItem = allItemsInMainCategory[randomIndex];
                
                // Add to newlySelectedTags if not already picked (mainly to avoid issues if a tag could somehow be in multiple main categories by mistake)
                if (!newlySelectedTags.some(st => st.en === randomItem.en) && !allInOneSelectedTagsGlobal.some(ast => ast.en === randomItem.en) ) {
                     newlySelectedTags.push({
                        en: randomItem.en,
                        ja: randomItem.ja,
                        mainCategory: mainCategoryName
                    });
                }
            }
        }
    
        allInOneSelectedTagsGlobal.push(...newlySelectedTags);
            
        // Update UI
        renderSelectedTagPills();
        renderCombinedJapaneseTranslation();
        updateAllInOneTokenCounter();
    
        // Update selection state of main tag buttons
        const allMainTagButtons = document.querySelectorAll<HTMLButtonElement>('#all-in-one-dynamic-content-area .tag-item-button');
        allMainTagButtons.forEach(btn => {
            const enTag = btn.dataset.tagEn;
            if (enTag && allInOneSelectedTagsGlobal.some(sTag => sTag.en === enTag)) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
    });


    if (templateButtonsContainer) {
        for (const templateName in templates) {
            const button = document.createElement('button');
            button.classList.add('template-button');
            button.textContent = templateName;
            button.type = 'button';
            button.addEventListener('click', () => {
                const template = templates[templateName];
                freeTextPromptTextarea.value = template.freeText;
                for (const selectId in template.settings) {
                    if (selectElements[selectId]) {
                        (selectElements[selectId] as HTMLSelectElement).value = template.settings[selectId];
                    }
                }
                 const modelFeaturesTabButton = document.querySelector<HTMLButtonElement>('.tab-button[data-tab="model-features"]');
                 modelFeaturesTabButton?.click();
            });
            templateButtonsContainer.appendChild(button);
        }
    }

    mainTabButtons?.forEach(button => {
        button.addEventListener('click', () => {
            mainTabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            button.classList.add('active');
            const tabId = button.dataset.tab;
            if (tabId) { 
                document.getElementById(`${tabId}-tab`)?.classList.add('active');
            }
        });
    });

    const randomAction = () => {
        allSelectIds.forEach(id => {
            const selectElement = selectElements[id];
            if (selectElement) {
                const options = Array.from(selectElement.options);
                const validOptions = options.filter(option => option.value !== "");
                if (validOptions.length > 0) {
                    const randomIndex = Math.floor(Math.random() * validOptions.length);
                    selectElement.value = validOptions[randomIndex].value;
                }
            }
        });
        if (freeTextPromptTextarea) freeTextPromptTextarea.value = ""; 

        allInOneResetButton?.click();
    };

    randomButton?.addEventListener('click', randomAction);


    outputTabButtons?.forEach(button => {
        button.addEventListener('click', () => {
            outputTabButtons.forEach(btn => btn.classList.remove('active'));
            yamlCodeButton.classList.remove('active'); // Ensure YAML button is also deactivated
            button.classList.add('active');
        });
    });
    yamlCodeButton?.addEventListener('click', () => {
        outputTabButtons?.forEach(btn => btn.classList.remove('active'));
        yamlCodeButton.classList.add('active');
        // YAML generation logic is separate
    });


    resetButton?.addEventListener('click', () => {
        allSelectIds.forEach(id => {
            if (selectElements[id]) {
                (selectElements[id] as HTMLSelectElement).value = "";
            }
        });
        if (freeTextPromptTextarea) freeTextPromptTextarea.value = "";
        if (promptToConvertInputTextarea) promptToConvertInputTextarea.value = "";
        promptOutputEnTextarea.value = "";
        promptOutputJaTextarea.value = "";
        generatePromptButton.disabled = false;
        generatePromptButton.innerHTML = 'プロンプトを生成';
        executeTextConversionButton.disabled = false;
        executeTextConversionButton.innerHTML = '入力テキストを要素分解';
        loadImageAndDeconstructButton.disabled = false;
        loadImageAndDeconstructButton.innerHTML = '画像から読込＆要素分解';
        copyPromptButton.textContent = '英語プロンプトをコピー';

        allInOneResetButton?.click();
    });


    copyPromptButton?.addEventListener('click', async () => {
        if (!promptOutputEnTextarea.value) return;
        try {
            await navigator.clipboard.writeText(promptOutputEnTextarea.value);
            copyPromptButton.textContent = 'コピーしました！';
            setTimeout(() => { copyPromptButton.textContent = '英語プロンプトをコピー'; }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            copyPromptButton.textContent = 'コピー失敗';
            setTimeout(() => { copyPromptButton.textContent = '英語プロンプトをコピー'; }, 2000);
        }
    });

    const performPromptGeneration = async (initiatingButton: HTMLButtonElement, originalText: string) => {
        if (!API_KEY) {
            promptOutputEnTextarea.value = "エラー: APIキーが設定されていません。";
            return;
        }

        initiatingButton.disabled = true;
        initiatingButton.innerHTML = '生成中... <span class="spinner"></span>';
        promptOutputEnTextarea.value = "";
        promptOutputJaTextarea.value = "";

        const selectedValues: { [key: string]: string } = {};
        let characteristicsString = "ユーザーが選択した特徴:\n";
        let isCharacterSheet = false;
        let hasSelection = false;

        allSelectIds.forEach(id => {
            const selectElement = selectElements[id];
            if (selectElement && selectElement.value) {
                const labelElement = document.querySelector(`label[for="${id}"]`);
                const labelText = labelElement ? labelElement.textContent?.trim() : id;
                const selectedOptionText = selectElement.options[selectElement.selectedIndex].text;
                selectedValues[labelText || id] = selectedOptionText;
                characteristicsString += `- ${labelText}: ${selectedOptionText}\n`;
                if (id === 'composition' && selectElement.value === 'character_sheet_views_expressions') {
                    isCharacterSheet = true;
                }
                hasSelection = true;
            }
        });

        const freeText = freeTextPromptTextarea?.value.trim();
        if (freeText) {
            characteristicsString += `- 自由記述: ${freeText}\n`;
            hasSelection = true;
        }

        if (!hasSelection) {
            promptOutputEnTextarea.value = "特徴を少なくとも1つ選択するか、自由記述欄に入力してください。";
            initiatingButton.disabled = false;
            initiatingButton.innerHTML = originalText;
            return;
        }
        
        let characterSheetInstructions = "";
        if (isCharacterSheet) {
            characterSheetInstructions = "特に、これはキャラクター設定シートのためのプロンプトです。キャラクターの全身の正面、横、後ろ姿、そして複数の表情（例：笑顔、泣き顔、怒った顔、照れ顔）を明確に示す構成で記述してください。各ビューや表情は明確に区別できるように、詳細かつ具体的に指示してください。";
        }
        
        const selectedStyleValue = selectElements['style-select']?.value || "";
        const selectedStyleText = selectElements['style-select']?.options[selectElements['style-select'].selectedIndex]?.text || "";
        let styleConstraint = "";
        if (photographicStyles.includes(selectedStyleValue)) {
            styleConstraint = `IMPORTANT STYLE CONSTRAINT: The user has selected a photographic style ('${selectedStyleText}'). For the English prompt, you MUST focus on terms suitable for realistic photography. STRICTLY AVOID any artistic, CG, or illustrative terms such as 'illustration', 'concept art', 'artstation', 'painting', 'drawing', 'sketch', 'comic', 'anime', 'manga', '3D render', 'unreal engine', 'octane render', 'cgi', 'vfx', 'cartoonish', 'stylized'. Emphasize camera settings, lens types, lighting, and real-world photographic qualities if appropriate.`;
        }

        const activeOutputTabButton = outputTabsNav?.querySelector<HTMLButtonElement>('.output-tab-button.active');
        const activeOutputTab = activeOutputTabButton?.dataset.outputTab;
        
        let promptStyleGuidance = "生成するプロンプトは英語で、カンマ区切りのキーワードやフレーズ形式にしてください。画質を向上させる一般的なキーワード（例: masterpiece, best quality, high resolution, highly detailed）や、スタイルや内容に応じた具体的なタグを積極的に使用してください。";
        if (activeOutputTab === 'midjourney') {
            promptStyleGuidance = "MIDJOURNEY PROMPT STYLE: The output is targeted for Midjourney. Generate a descriptive, natural language English prompt. While some keywords can be used, prioritize a more scenic and evocative description. Avoid an overly dense list of comma-separated keywords. The prompt should feel like a well-written artistic brief, focusing on scene composition, mood, subject details, and overall artistic direction.";
        } else if (activeOutputTab === 'stablediffusion') {
            promptStyleGuidance = "STABLE DIFFUSION PROMPT STYLE: Generate an English prompt consisting of comma-separated keywords and descriptive phrases. Focus on high-impact tags that define the subject, style, quality, and artistic details. For example: '1girl, solo, masterpiece, best quality, ultra-detailed, illustration, beautiful detailed eyes, long blonde hair, looking at viewer, school uniform, outdoor, cherry blossoms'.";
        }


        const systemPromptForGeneration = `
あなたは、AI画像生成モデル（例: ImageFX, Midjourney, Stable Diffusion）で使用するための、高品質な英語のプロンプトを作成する専門家です。「プロンプトジェネレーター」として、ユーザー指定のテーマで画像を生成することに特化しています。
あなたの仕事は、ユーザーが日本語で指定する様々な特徴や自由記述の指示を組み合わせ、芸術的で洗練された高品質の英語プロンプトと、その日本語翻訳を生成することです。
${characterSheetInstructions}
${styleConstraint}

以下のガイドラインに従ってください:
1.  ${promptStyleGuidance}
2.  「masterpiece」「high detail」「sharp focus」「concept art」「trending on artstation」「cinematic composition」「highly detailed illustration」など、画像の品質とデザイン性を高めるキーワードを適切に含めてください。ただし、上記の STYLE CONSTRAINT がある場合はそれに従ってください。
3.  ユーザーが選択した構造化された特徴と、「自由記述」欄のテキストを最大限に活かし、それらが調和するようにプロンプトを構築してください。「自由記述」の内容は特に重要な指示として扱ってください。
4.  特に指定がない限り、顔の美しさ、スタイリッシュな髪型、ファッションセンス、ポーズの自然さ、全体の美的調和など、人物を魅力的に見せるデザイン的要素を強調してください。
5.  最終的な応答は、必ず以下のJSON形式で提供してください:
    {
      "englishPrompt": "生成された英語のプロンプト...",
      "japaneseTranslation": "生成された英語プロンプトの日本語訳..."
    }
6.  プロンプトは創造的かつ具体的であるべきです。ネガティブプロンプトは不要です。

ユーザーが選択した日本語の特徴と自由記述は以下の通りです。
${characteristicsString}
`;

        try {
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash-preview-04-17',
                contents: systemPromptForGeneration,
                config: { responseMimeType: "application/json" }
            });

            let jsonStr = response.text.trim();
            const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
            const match = jsonStr.match(fenceRegex);
            if (match && match[2]) {
                jsonStr = match[2].trim();
            }

            const parsedData = JSON.parse(jsonStr);
            let englishPrompt = parsedData.englishPrompt || "英語プロンプトの生成に失敗しました。";
            
            if (activeOutputTab === 'midjourney') {
                const aspectRatioValue = selectElements['aspect-ratio']?.value;
                if (aspectRatioValue) {
                    const ratioMatch = aspectRatioValue.match(/(\d+:\d+)/);
                    if (ratioMatch && ratioMatch[1]) {
                        englishPrompt += ` --ar ${ratioMatch[1]}`;
                    }
                }
                englishPrompt += " --q 1 --style raw";
            }
            
            promptOutputEnTextarea.value = englishPrompt;
            promptOutputJaTextarea.value = parsedData.japaneseTranslation || "日本語訳の生成に失敗しました。";

        } catch (error) {
            console.error("Error generating prompt:", error);
            const errorMsg = "プロンプトの生成中にエラー: " + (error instanceof Error ? error.message : String(error));
            promptOutputEnTextarea.value = errorMsg;
            promptOutputJaTextarea.value = "エラーのため翻訳は行われませんでした。";
        } finally {
            initiatingButton.disabled = false;
            initiatingButton.innerHTML = originalText;
        }
    };
    
    generatePromptButton?.addEventListener('click', () => {
        performPromptGeneration(generatePromptButton, 'プロンプトを生成');
    });

    const deconstructTextToFeatures = async (textToConvert: string, initiatingButton: HTMLButtonElement, originalButtonText: string) => {
        if (!textToConvert) {
            promptOutputEnTextarea.value = "「変換したいプロンプトを入力」欄にテキストを入力してください。";
            if (promptOutputJaTextarea) promptOutputJaTextarea.value = "";
            return false;
        }
         if (!API_KEY) {
            promptOutputEnTextarea.value = "エラー: APIキーが設定されていません。";
            return false;
        }


        initiatingButton.disabled = true;
        initiatingButton.innerHTML = '要素分解中... <span class="spinner"></span>';
        
        const dropdownLabelsToIds: { [key: string]: string } = {
            "スタイル選択": "style-select",
            "国籍/民族的特徴": "ethnicity", "年齢層": "age-group", "髪型": "hairstyle", "髪色": "hair-color",
            "服装スタイル": "clothing-style", "服の色味": "clothing-color", "服の柄": "clothing-pattern",
            "ポーズ": "pose", "表情": "facial-expression", "靴": "shoes",
            "照明条件": "lighting-conditions", "カラーグレーディング": "color-grading", "構図": "composition",
            "背景": "background-setting", "時間帯": "time-of-day", "全体的な雰囲気": "overall-atmosphere", "季節感": "season",
            "レンダリング品質": "rendering-quality", "アスペクト比": "aspect-ratio"
        };
        const categoryKeysForGemini = JSON.stringify(Object.keys(dropdownLabelsToIds));

        const systemPromptForParsing = `
あなたはテキスト解析アシスタントです。ユーザーが入力した日本語の画像生成プロンプトの自由記述テキストから、以下のカテゴリに合致する特徴を抽出し、それぞれのカテゴリに最も適した日本語の選択肢の「テキスト内容」を特定してください。
抽出するカテゴリ: ${categoryKeysForGemini}

応答は必ず以下のJSON形式で提供してください:
{
  "parsedFeatures": {
    "カテゴリ名1": "抽出された日本語のテキスト1",
    "カテゴリ名2": "抽出された日本語のテキスト2"
  },
  "remainingText": "カテゴリに分類できなかった残りのテキスト..."
}
例えば、「赤いドレスの金髪の女性、背景は夜の街」というテキストの場合、以下のように返します:
{
  "parsedFeatures": {
    "髪色": "金髪", 
    "服装スタイル": "ドレス", 
    "服の色味": "赤" 
  },
  "remainingText": "背景は夜の街"
}
入力されたテキストに含まれないカテゴリについては、"parsedFeatures"に含めないでください。"remainingText"には、どのカテゴリにも明確に分類できないがプロンプトの一部として重要そうな残りのテキストを含めてください。`;
        try {
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash-preview-04-17',
                contents: `${systemPromptForParsing}\n\n解析対象のテキスト:\n${textToConvert}`,
                config: { responseMimeType: "application/json" }
            });

            let jsonStr = response.text.trim();
            const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
            const match = jsonStr.match(fenceRegex);
            if (match && match[2]) {
                jsonStr = match[2].trim();
            }
            
            const parsedResponse = JSON.parse(jsonStr);
            const parsedFeatures = parsedResponse.parsedFeatures || {};
            const remainingText = parsedResponse.remainingText || "";

            allSelectIds.forEach(id => {
                if (selectElements[id]) (selectElements[id] as HTMLSelectElement).value = "";
            });

            for (const categoryLabel in parsedFeatures) {
                const selectId = dropdownLabelsToIds[categoryLabel];
                const suggestedText = String(parsedFeatures[categoryLabel]).trim(); 
                if (selectId && selectElements[selectId] && suggestedText) {
                    const selectElement = selectElements[selectId] as HTMLSelectElement;
                    let foundOption = false;
                    for (let i = 0; i < selectElement.options.length; i++) {
                        if (selectElement.options[i].text.includes(suggestedText) || suggestedText.includes(selectElement.options[i].text) ) {
                             if (selectElement.options[i].value !== "") { 
                                selectElement.value = selectElement.options[i].value;
                                foundOption = true;
                                break;
                             }
                        }
                    }
                     if(!foundOption){ 
                         for (let i = 0; i < selectElement.options.length; i++) {
                            if (selectElement.options[i].value.toLowerCase().includes(suggestedText.toLowerCase())) {
                                if (selectElement.options[i].value !== "") {
                                    selectElement.value = selectElement.options[i].value;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            
            if (freeTextPromptTextarea) {
                freeTextPromptTextarea.value = remainingText;
            }
            
            promptOutputEnTextarea.value = "プロンプトの要素が各項目に割り当てられました。\n「追加設定」タブの「自由記述」欄も確認してください。\n内容を確認し、「プロンプトを生成」ボタンを押してください。";
            if(promptOutputJaTextarea) promptOutputJaTextarea.value = "";
            return true;

        } catch (error) {
            console.error("Error during prompt deconstruction:", error);
            promptOutputEnTextarea.value = "プロンプトの要素分解中にエラーが発生しました。\n" + (error instanceof Error ? error.message : String(error));
            if(promptOutputJaTextarea) promptOutputJaTextarea.value = "";
            return false;
        } finally {
            initiatingButton.disabled = false;
            initiatingButton.innerHTML = originalButtonText;
        }
    };
    
    executeTextConversionButton?.addEventListener('click', () => {
        const textToConvert = promptToConvertInputTextarea?.value.trim();
        if (textToConvert) {
            deconstructTextToFeatures(textToConvert, executeTextConversionButton, '入力テキストを要素分解');
        } else {
             promptOutputEnTextarea.value = "「変換したいプロンプトを入力」欄にテキストを入力してください。";
             if (promptOutputJaTextarea) promptOutputJaTextarea.value = "";
        }
    });

    loadImageAndDeconstructButton?.addEventListener('click', () => {
        imageFileInput?.click();
    });

    imageFileInput?.addEventListener('change', async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;

        if (!API_KEY) {
            promptOutputEnTextarea.value = "エラー: APIキーが設定されていません。";
            return;
        }

        loadImageAndDeconstructButton.disabled = true;
        loadImageAndDeconstructButton.innerHTML = '画像解析中... <span class="spinner"></span>';
        promptToConvertInputTextarea.value = ""; // Clear for new analysis

        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64ImageDataString = (reader.result as string).split(',')[1];
                
                const imagePart = {
                    inlineData: {
                        mimeType: file.type,
                        data: base64ImageDataString,
                    },
                };
                const textPart = {
                    text: "この画像を詳細に日本語で説明してください。AI画像生成のためのプロンプトとして使えるように、見た目の特徴、スタイル、被写体、雰囲気、色使い、構図などを具体的に記述してください。箇条書きではなく、自然な説明文の形式でお願いします。"
                };

                try {
                    const response = await ai.models.generateContent({
                        model: 'gemini-2.5-flash-preview-04-17', 
                        contents: { parts: [imagePart, textPart] },
                    });
                    
                    const imageDescription = response.text.trim();
                    promptToConvertInputTextarea.value = imageDescription;

                    await deconstructTextToFeatures(imageDescription, loadImageAndDeconstructButton, '画像から読込＆要素分解');
                
                } catch (geminiError) {
                    console.error("Error generating image description:", geminiError);
                    promptOutputEnTextarea.value = "画像の説明生成中にエラーが発生しました。\n" + (geminiError instanceof Error ? geminiError.message : String(geminiError));
                    if(promptOutputJaTextarea) promptOutputJaTextarea.value = "";
                    loadImageAndDeconstructButton.disabled = false;
                    loadImageAndDeconstructButton.innerHTML = '画像から読込＆要素分解';
                }
            };
            reader.readAsDataURL(file);
        } catch (fileReadError) {
            console.error("Error reading file:", fileReadError);
            promptOutputEnTextarea.value = "ファイルの読み込み中にエラーが発生しました。";
            loadImageAndDeconstructButton.disabled = false;
            loadImageAndDeconstructButton.innerHTML = '画像から読込＆要素分解';
        }
        if (imageFileInput) imageFileInput.value = "";
    });


    yamlCodeButton?.addEventListener('click', () => {
        let yamlString = "";
        const categories: { [key: string]: { [key: string]: string } } = {
            "スタイル": {}, "モデル特徴": {}, "照明設定等": {}, "撮影環境": {}, "追加設定": {}
        };

        const categoryMapping: { [key: string]: string } = {
            'style-select': "スタイル",
            'ethnicity': "モデル特徴", 'age-group': "モデル特徴", 'hairstyle': "モデル特徴", 'hair-color': "モデル特徴", 
            'clothing-style': "モデル特徴", 'clothing-color': "モデル特徴", 'clothing-pattern': "モデル特徴", 
            'pose': "モデル特徴", 'facial-expression': "モデル特徴", 'shoes': "モデル特徴",
            'lighting-conditions': "照明設定等", 'color-grading': "照明設定等", 'composition': "照明設定等",
            'background-setting': "撮影環境", 'time-of-day': "撮影環境", 'overall-atmosphere': "撮影環境", 'season': "撮影環境",
            'rendering-quality': "追加設定", 'aspect-ratio': "追加設定"
        };
        
        allSelectIds.forEach(id => {
            const selectElement = selectElements[id];
            if (selectElement && selectElement.value) {
                const labelElement = document.querySelector(`label[for="${id}"]`);
                const labelText = labelElement ? labelElement.textContent?.trim() : id;
                const selectedOptionText = selectElement.options[selectElement.selectedIndex].text;
                const category = categoryMapping[id] || "その他";
                if (!categories[category]) categories[category] = {};
                categories[category][labelText || id] = selectedOptionText;
            }
        });
        
        const freeText = freeTextPromptTextarea?.value.trim();
        if (freeText) {
            if (!categories["追加設定"]) categories["追加設定"] = {};
            categories["追加設定"]["自由記述"] = freeText;
        }

        for (const categoryName in categories) {
            if (Object.keys(categories[categoryName]).length > 0) {
                yamlString += `${categoryName}:\n`;
                for (const label in categories[categoryName]) {
                    yamlString += `  ${label}: ${categories[categoryName][label]}\n`;
                }
            }
        }

        if (!yamlString) yamlString = "# 項目が選択されていません。";
        
        promptOutputEnTextarea.value = yamlString.trim();
        promptOutputJaTextarea.value = "# YAMLモードでは日本語訳は生成されません。";
    });

    const initialActiveMainTab = document.querySelector<HTMLButtonElement>('#main-tabs-nav .tab-button.active');
    if (initialActiveMainTab) {
        const initialTabId = initialActiveMainTab.dataset.tab;
         if (initialTabId) document.getElementById(`${initialTabId}-tab`)?.classList.add('active');
    } else if (mainTabButtons && mainTabButtons.length > 0) {
        const firstActualTab = Array.from(mainTabButtons).find(btn => btn.id !== 'random-button'); 
        if (firstActualTab) {
            firstActualTab.classList.add('active');
            const firstTabId = firstActualTab.dataset.tab;
            if (firstTabId) document.getElementById(`${firstTabId}-tab`)?.classList.add('active');
        }
    }


    const initialActiveOutputTab = document.querySelector<HTMLButtonElement>('#output-tabs-nav .output-tab-button.active');
     if (!initialActiveOutputTab && outputTabButtons && outputTabButtons.length > 0) {
        outputTabButtons[0].classList.add('active');
     }
});
