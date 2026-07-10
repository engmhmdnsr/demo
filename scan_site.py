import os
import sys
from html.parser import HTMLParser
import urllib.parse

class MyHTMLParser(HTMLParser):
    def __init__(self, filename):
        super().__init__()
        self.filename = filename
        self.tags = []
        self.links = []
        self.images = []
        self.line_numbers = []

    def handle_starttag(self, tag, attrs):
        void_elements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']
        if tag not in void_elements:
            self.tags.append(tag)
            self.line_numbers.append(self.getpos()[0])
            
        for attr, val in attrs:
            if attr == 'href' and val:
                self.links.append((val, self.getpos()[0]))
            elif attr == 'src' and val:
                self.images.append((val, self.getpos()[0]))

    def handle_endtag(self, tag):
        void_elements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']
        if tag not in void_elements:
            if self.tags and self.tags[-1] == tag:
                self.tags.pop()
                self.line_numbers.pop()
            else:
                pass # Ignoring mismatch for now to avoid false positives with poorly formatted HTML, focusing on left-over unclosed tags

def scan_website(directory):
    html_files = [f for f in os.listdir(directory) if f.endswith('.html')]
    issues_found = False

    for file in html_files:
        filepath = os.path.join(directory, file)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            parser = MyHTMLParser(file)
            parser.feed(content)
            
            file_issues = []
            
            # Check unclosed div/ul/li/etc. We only alert if there are major unclosed structure tags
            critical_tags = ['div', 'ul', 'section', 'nav', 'main', 'footer', 'header', 'a']
            unclosed_critical = [t for t in parser.tags if t in critical_tags]
            if len(unclosed_critical) > 5: # If there are many, it's definitely broken
                file_issues.append(f"  - High number of unclosed structural tags: {len(unclosed_critical)} (e.g. {', '.join(list(set(unclosed_critical)))[:50]})")
            
            # Check links
            for link, line in parser.links:
                if link.startswith('http') or link.startswith('mailto:') or link.startswith('tel:') or link.startswith('#'):
                    continue
                # strip query params
                link = link.split('?')[0].split('#')[0]
                if not link:
                    continue
                target_path = os.path.join(directory, urllib.parse.unquote(link))
                if not os.path.exists(target_path):
                    file_issues.append(f"  - Broken link at line {line}: {link}")
                    
            # Check images
            for img, line in parser.images:
                if img.startswith('http') or img.startswith('data:'):
                    continue
                target_path = os.path.join(directory, urllib.parse.unquote(img))
                if not os.path.exists(target_path):
                    file_issues.append(f"  - Broken image/script at line {line}: {img}")
                    
            if file_issues:
                issues_found = True
                print(f"Issues in {file}:")
                for issue in file_issues:
                    print(issue)
                    
        except Exception as e:
            print(f"Error parsing {file}: {e}")
            issues_found = True
            
    if not issues_found:
        print("✅ Scan complete. No critical broken links or missing images found in HTML files.")

if __name__ == '__main__':
    scan_website('d:/SACARABIACODE-main')
