import re
import unicodedata

try:
    import emoji 
    _HAS_EMOJI = True
except Exception:
    _HAS_EMOJI = False



stopwords_set = [
    "දෝහෝ", "ශ්‍රී", "හා", "ය", "නම්", "වැඩි", "සිට", "දෙස", "එලෙසින්ම", "එහෙත්",
    "දී", "සා", "තාක්", "තුවක්", "පවා", "ද", "හෝ‍", "වත්", "විනා", "කා", "දී",
    "මංද", "මේම", "ටික", "ලු", "ක්ද", "ක්", "විනා", "මේක", "ක්", "දී", "සිදු",
    "වශයෙන්", "යන", "සඳහා", "හෝ‍", "ඉතා", "ඒ", "එම", "ද", "අතර", "විසින්", "තුළ",
    "බව", "මහ", "මෙම", "මෙහි", "වෙත", "වෙතින්", "වෙතට", "වෙනුවෙන්", "වෙනුවට",
    "වෙන", "ගැන", "නෑ", "අනුව", "නව", "දැනට", "එහෙන්", "මෙහෙන්", "එහේ", "මෙහේ",
    "ම", "තවත්", "තව", "සහ", "දක්වා", "ට", "ගේ", "එ", "ක", "ක්", "බවත්", "බවද",
    "මත", "මෙසේ", "වඩා", "වඩාත්ම", "නිති", "නිතිත්", "නිතොර", "නිතර", "ඉක්බිති",
    "දැන්", "යලි", "පුන", "ඉතින්", "සිට", "සිටන්", "පටන්", "තෙක්", "දක්වා", "සා",
    "තාක්", "තුවක්", "පවා", "ද", "හෝ‍", "වත්", "විනා", "හැර", "මිස", "මුත්", "කිම",
    "කිම්", "ඇයි", "මන්ද", "හෙවත්", "නොහොත්", "පතා", "පාසා", "ගානෙ", "තව", "ඉතා",
    "බොහෝ", "වහා", "සෙද", "සැනින්", "හනික", "එම්බා", "එම්බල", "බොල", "වනාහි", "කලී",
    "ඉඳුරා", "ඔන්න", "මෙන්න", "උදෙසා", "පිණිස", "සඳහා", "රබයා", "නිසා", "එනිසා",
    "සේක්", "සේක", "ගැන", "අනුව", "පරිදි", "විට", "තෙක්", "මෙතෙක්", "මේතාක්", "තුරු",
    "තුරා", "තුරාවට", "තුලින්", "එයින්", "එහිදී", "වස්", "මෙන්", "ලෙස", "එහෙත්",
    "නං", "මං", "ආ", "නේ", "හුම්", "පෑං", "ප්‍රශ්ණ", "තරන්", "ඉ", "පැපී", "තූ",
    "ඉතිනා", "ම්ම්ම්ම්", "එක", "ඔව්", "බ", "ස්", "හු", "නෙහ්", "බූ", "යෝ", "හම්මට"
]
stopwords_set = set(stopwords_set)


characters_dict = {
    "ළ": "ල",
    "ණ": "න",
    "ඛ": "ක",
    "ශ": "ෂ",
    "ඝ": "ග",
    "ඳ": "ද",
    "ඵ": "ප",
    "ඟ": "ග",
    "ඡ": "ච",
    "ඣ": "ජ",
    "ඦ": "ජ",
    "භ": "බ",
    "ඤ": "ඥ",
    "ඨ": "ට",
    "ඪ": "ඩ",
    "ඹ": "බ",
    "ආ": "අ",
    "ඈ": "ඇ",
    "ඊ": "ඉ",
    "ඌ": "උ",
    "ඒ": "එ",
    "ඕ": "ඔ",
}


def changed_characters_dict(character: str) -> str:
    if len(character) != 1:
        raise TypeError("character should be a string with length 1")
    try:
        return characters_dict[character]
    except KeyError:
        return character


def simplify_sinhalese_text(text: str) -> str:
    modified_text = ""
    for c in text:
        modified_text += changed_characters_dict(c)
    return modified_text


def remove_stopwords(text: str) -> str:
    tokens = text.split()
    tokens = [t for t in tokens if t not in stopwords_set]
    return " ".join(tokens)


def clean_text(text: str) -> str:
    text = "" if text is None else str(text)


    text = unicodedata.normalize("NFKC", text)

    # removing URLs
    text = re.sub(r"http[s]?://\S+|www\.\S+", " ", text)

    # removing RT tags
    text = re.sub(r"(^|\s)RT\s+@\S+:\s*", " ", text)
    text = re.sub(r"(^|\s)RT(\s|$)", " ", text)

    # removing @mentions
    text = re.sub(r"@\S+", " ", text)

    # removing hashtag symbols and underscores
    text = text.replace("#", " ")
    text = text.replace("_", " ")

    # removing emojis
    if _HAS_EMOJI:
        text = emoji.replace_emoji(text, " ")

    # removing English letters
    text = re.sub(r"[A-Za-z]", " ", text)

    # removing numbers
    text = re.sub(r"\d+", " ", text)

    # keeping Sinhala unicode chars + ZWJ/ZWNJ + spaces + question mark
    text = re.sub(r"[^\u0D80-\u0DFF\u200D\u200C\s?]", " ", text)

    # question mark normalization
    text = re.sub(r"\?{2,}", "?", text)
    text = re.sub(r"\s+\?", "?", text)

    # whitespace cleanup
    text = re.sub(r"[\r\n]+", " ", text)
    text = re.sub(r"\s+", " ", text).strip()

    # stopword removal
    text = remove_stopwords(text)

    # Sinhala character simplification
    text = simplify_sinhalese_text(text)

    # final cleanup after stopword removal + simplification
    text = re.sub(r"\s+", " ", text).strip()

    return text