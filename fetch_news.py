import json,urllib.request,xml.etree.ElementTree as ET,email.utils,datetime,pathlib,time
TOPICS={'WORLD':'world international','TECH':'technology cybersecurity','SCIENCE':'science discovery','SPACE':'space astronomy','ECONOMY':'business economy'}
output={}; now=datetime.datetime.now(datetime.timezone.utc).isoformat()
for category,term in TOPICS.items():
    from urllib.parse import quote
    url='https://news.google.com/rss/search?q='+quote(term+' when:2d')+'&hl=en-US&gl=US&ceid=US:en'
    articles=[]
    for attempt in range(2):
        try:
            req=urllib.request.Request(url,headers={'User-Agent':'ASCENSION-NewsCollector/1.4 (GitHub Actions; RSS reader)'})
            with urllib.request.urlopen(req,timeout=18) as r: root=ET.fromstring(r.read(600000))
            for item in root.findall('./channel/item')[:16]:
                title=(item.findtext('title') or '').strip();link=(item.findtext('link') or '').strip()
                if not title or not link.startswith('https://'):continue
                source=item.findtext('source') or 'Google News';date=item.findtext('pubDate') or ''
                articles.append({'title':title,'url':link,'source':source,'date':date})
            break
        except Exception as e:
            print(category,'attempt',attempt+1,'failed:',e);time.sleep(1)
    output[category]=articles[:12]
path=pathlib.Path('news.json')
try: old=json.loads(path.read_text(encoding='utf-8'))
except (OSError,ValueError):old={}
for key in TOPICS:
    if not output[key]:output[key]=old.get('topics',{}).get(key,[])
if not any(output.values()):raise SystemExit('All feeds unavailable and no previous news to retain')
path.write_text(json.dumps({'updated':now,'topics':output},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Saved', {k:len(v) for k,v in output.items()})
