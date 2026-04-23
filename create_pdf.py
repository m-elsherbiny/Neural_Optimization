from markdown_pdf import MarkdownPdf
from markdown_pdf import Section

def convert():
    pdf = MarkdownPdf()
    with open("Project_Explanation.md", "r", encoding="utf-8") as f:
        content = f.read()
        
    pdf.add_section(Section(content))
    pdf.save("Project_Explanation.pdf")
    print("PDF generated successfully.")

if __name__ == "__main__":
    convert()
