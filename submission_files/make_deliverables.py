import os
import sys
import csv
import subprocess

# Professional Pure-Python PDF Engine
class AcademicPDF:
    def __init__(self, filename, title="", subject="", author="Learner"):
        self.filename = filename
        self.width = 595.28  # A4 width in pt
        self.height = 841.89 # A4 height in pt
        self.margin_x = 50
        self.margin_top = 54
        self.margin_bottom = 54
        self.title = title
        self.subject = subject
        self.author = author
        
        self.pages = []
        self.current_stream = []
        self.current_y = self.height - self.margin_top
        self.page_number = 0
        self.total_pages_placeholder = 0
        self.in_cover = False

    def new_page(self, is_cover=False):
        if self.current_stream:
            self.pages.append("\n".join(self.current_stream))
            self.current_stream = []
        self.page_number += 1
        self.in_cover = is_cover
        self.current_y = self.height - self.margin_top
        if not is_cover:
            self._draw_header_footer()

    def _draw_header_footer(self):
        # Header line & text
        self.current_stream.append("q 0.7 0.7 0.7 RG 0.5 w")
        self.current_stream.append(f"{self.margin_x} {self.height - 40} m {self.width - self.margin_x} {self.height - 40} l S")
        self.current_stream.append(f"{self.margin_x} 42 m {self.width - self.margin_x} 42 l S")
        self.current_stream.append("Q")
        
        # Header text
        self.current_stream.append("BT /F1 7.5 Tf 0.35 0.35 0.35 rg")
        clean_hdr = "HCLTech Career Shaper Programme | Project 77: Agentic AI Task Planner with Tool Use"
        self.current_stream.append(f"{self.margin_x} {self.height - 34} Td ({clean_hdr}) Tj ET")
        
        # Footer text
        self.current_stream.append("BT /F1 7.5 Tf 0.35 0.35 0.35 rg")
        self.current_stream.append(f"{self.margin_x} 30 Td (Academic Year 2025-26 | Individual Project Deliverable) Tj ET")
        self.current_stream.append(f"BT /F2 8 Tf 0.2 0.3 0.6 rg")
        self.current_stream.append(f"{self.width - self.margin_x - 45} 30 Td (Page {self.page_number}) Tj ET")

    def check_space(self, needed):
        if self.current_y - needed < self.margin_bottom:
            self.new_page()

    def add_title(self, text):
        clean_text = text.replace("(", "\\(").replace(")", "\\)")
        self.check_space(50)
        self.current_stream.append(f"BT /F2 22 Tf 0.08 0.18 0.36 rg")
        self.current_stream.append(f"{self.margin_x} {self.current_y - 24} Td ({clean_text}) Tj ET")
        self.current_y -= 45

    def add_h1(self, text):
        clean_text = text.replace("(", "\\(").replace(")", "\\)")
        self.check_space(40)
        self.current_y -= 12
        # Section bar
        self.current_stream.append("q 0.1 0.25 0.55 rg")
        self.current_stream.append(f"{self.margin_x} {self.current_y - 14} 4 16 re f Q")
        self.current_stream.append(f"BT /F2 13.5 Tf 0.1 0.22 0.45 rg")
        self.current_stream.append(f"{self.margin_x + 10} {self.current_y - 12} Td ({clean_text}) Tj ET")
        self.current_y -= 26

    def add_h2(self, text):
        clean_text = text.replace("(", "\\(").replace(")", "\\)")
        self.check_space(30)
        self.current_y -= 8
        self.current_stream.append(f"BT /F2 11 Tf 0.18 0.25 0.35 rg")
        self.current_stream.append(f"{self.margin_x} {self.current_y - 10} Td ({clean_text}) Tj ET")
        self.current_y -= 20

    def add_paragraph(self, text, font_size=9.2, italic=False, color=(0.18, 0.18, 0.18), space_after=6):
        font = "/F3" if italic else "/F1"
        line_height = font_size * 1.38
        words = text.split(" ")
        current_line = []
        max_chars = int((self.width - 2 * self.margin_x) / (font_size * 0.51))

        for word in words:
            if len(" ".join(current_line + [word])) <= max_chars:
                current_line.append(word)
            else:
                line_str = " ".join(current_line).replace("(", "\\(").replace(")", "\\)")
                self.check_space(line_height)
                self.current_stream.append(f"BT {font} {font_size} Tf {color[0]} {color[1]} {color[2]} rg")
                self.current_stream.append(f"{self.margin_x} {self.current_y - line_height} Td ({line_str}) Tj ET")
                self.current_y -= line_height
                current_line = [word]
        if current_line:
            line_str = " ".join(current_line).replace("(", "\\(").replace(")", "\\)")
            self.check_space(line_height + space_after)
            self.current_stream.append(f"BT {font} {font_size} Tf {color[0]} {color[1]} {color[2]} rg")
            self.current_stream.append(f"{self.margin_x} {self.current_y - line_height} Td ({line_str}) Tj ET")
            self.current_y -= (line_height + space_after)

    def add_bullet(self, title, text, font_size=9.0):
        line_height = font_size * 1.35
        full_text = f"• {title}: {text}" if title else f"• {text}"
        words = full_text.split(" ")
        current_line = []
        indent = 12
        max_chars = int((self.width - 2 * self.margin_x - indent) / (font_size * 0.51))

        for word in words:
            if len(" ".join(current_line + [word])) <= max_chars:
                current_line.append(word)
            else:
                line_str = " ".join(current_line).replace("(", "\\(").replace(")", "\\)")
                self.check_space(line_height)
                self.current_stream.append(f"BT /F1 {font_size} Tf 0.2 0.2 0.2 rg")
                self.current_stream.append(f"{self.margin_x + indent} {self.current_y - line_height} Td ({line_str}) Tj ET")
                self.current_y -= line_height
                current_line = [word]
        if current_line:
            line_str = " ".join(current_line).replace("(", "\\(").replace(")", "\\)")
            self.check_space(line_height + 4)
            self.current_stream.append(f"BT /F1 {font_size} Tf 0.2 0.2 0.2 rg")
            self.current_stream.append(f"{self.margin_x + indent} {self.current_y - line_height} Td ({line_str}) Tj ET")
            self.current_y -= (line_height + 4)

    def add_callout(self, title, text, alert_type="info"):
        # Alert box colors
        if alert_type == "warning":
            bg_color = "0.99 0.96 0.90"
            border_color = "0.85 0.55 0.15"
            title_color = "0.70 0.35 0.05"
        else:
            bg_color = "0.93 0.96 0.99"
            border_color = "0.20 0.45 0.80"
            title_color = "0.10 0.30 0.65"

        box_w = self.width - 2 * self.margin_x
        # approximate height
        lines = len(text) // 85 + 2
        box_h = lines * 13 + 24
        self.check_space(box_h + 10)
        self.current_y -= 6

        # Draw box background & border
        self.current_stream.append(f"q {bg_color} rg {self.margin_x} {self.current_y - box_h} {box_w} {box_h} re f Q")
        self.current_stream.append(f"q {border_color} RG 1.5 w {self.margin_x} {self.current_y - box_h} {box_w} {box_h} re S Q")
        # Left highlight bar
        self.current_stream.append(f"q {border_color} rg {self.margin_x} {self.current_y - box_h} 4 {box_h} re f Q")

        # Box title
        clean_title = title.replace("(", "\\(").replace(")", "\\)")
        self.current_stream.append(f"BT /F2 9.5 Tf {title_color} rg {self.margin_x + 12} {self.current_y - 16} Td ({clean_title}) Tj ET")

        # Box body
        cur_y = self.current_y - 30
        words = text.split(" ")
        cur_line = []
        for w in words:
            if len(" ".join(cur_line + [w])) <= 85:
                cur_line.append(w)
            else:
                line_str = " ".join(cur_line).replace("(", "\\(").replace(")", "\\)")
                self.current_stream.append(f"BT /F1 8.5 Tf 0.2 0.2 0.2 rg {self.margin_x + 12} {cur_y} Td ({line_str}) Tj ET")
                cur_y -= 12
                cur_line = [w]
        if cur_line:
            line_str = " ".join(cur_line).replace("(", "\\(").replace(")", "\\)")
            self.current_stream.append(f"BT /F1 8.5 Tf 0.2 0.2 0.2 rg {self.margin_x + 12} {cur_y} Td ({line_str}) Tj ET")

        self.current_y -= (box_h + 10)

    def add_table(self, headers, rows, col_widths=None):
        if not col_widths:
            avail_w = self.width - 2 * self.margin_x
            col_widths = [avail_w / len(headers)] * len(headers)
        
        row_height = 18
        table_h = (len(rows) + 1) * row_height + 10
        self.check_space(min(table_h, 150))
        
        # Draw header row
        self.current_y -= 6
        header_y = self.current_y - row_height
        self.current_stream.append(f"q 0.15 0.28 0.50 rg {self.margin_x} {header_y} {sum(col_widths)} {row_height} re f Q")
        
        # Header text
        cx = self.margin_x
        for i, h in enumerate(headers):
            clean_h = str(h).replace("(", "\\(").replace(")", "\\)")
            self.current_stream.append(f"BT /F2 8.5 Tf 1 1 1 rg {cx + 5} {header_y + 5} Td ({clean_h}) Tj ET")
            cx += col_widths[i]
        self.current_y -= row_height

        # Data rows
        for r_idx, row in enumerate(rows):
            self.check_space(row_height + 10)
            row_y = self.current_y - row_height
            bg = "0.96 0.97 0.99" if r_idx % 2 == 1 else "1.0 1.0 1.0"
            self.current_stream.append(f"q {bg} rg {self.margin_x} {row_y} {sum(col_widths)} {row_height} re f Q")
            self.current_stream.append(f"q 0.85 0.85 0.85 RG 0.5 w {self.margin_x} {row_y} {sum(col_widths)} {row_height} re S Q")
            
            cx = self.margin_x
            for c_idx, val in enumerate(row):
                clean_v = str(val).replace("(", "\\(").replace(")", "\\)")
                if len(clean_v) > 35:
                    clean_v = clean_v[:32] + "..."
                self.current_stream.append(f"BT /F1 8 Tf 0.2 0.2 0.2 rg {cx + 5} {row_y + 5} Td ({clean_v}) Tj ET")
                cx += col_widths[c_idx]
            self.current_y -= row_height
        
        self.current_y -= 10

    def draw_bar_chart(self, title, labels, values, max_val, bar_color="0.2 0.45 0.75"):
        chart_w = self.width - 2 * self.margin_x
        chart_h = 130
        self.check_space(chart_h + 30)
        self.current_y -= 8

        # Chart container
        box_y = self.current_y - chart_h
        self.current_stream.append(f"q 0.98 0.98 0.99 rg {self.margin_x} {box_y} {chart_w} {chart_h} re f Q")
        self.current_stream.append(f"q 0.82 0.85 0.90 RG 0.8 w {self.margin_x} {box_y} {chart_w} {chart_h} re S Q")

        # Chart Title
        clean_t = title.replace("(", "\\(").replace(")", "\\)")
        self.current_stream.append(f"BT /F2 9.5 Tf 0.1 0.2 0.4 rg {self.margin_x + 12} {self.current_y - 18} Td ({clean_t}) Tj ET")

        # Axes & Bars
        origin_x = self.margin_x + 50
        origin_y = box_y + 25
        plot_w = chart_w - 75
        plot_h = chart_h - 55

        # Horizontal baseline
        self.current_stream.append(f"q 0.5 0.5 0.5 RG 0.8 w {origin_x} {origin_y} m {origin_x + plot_w} {origin_y} l S Q")

        num_bars = len(labels)
        bar_slot = plot_w / num_bars
        bar_w = bar_slot * 0.55

        for i, (lbl, val) in enumerate(zip(labels, values)):
            bx = origin_x + i * bar_slot + (bar_slot - bar_w) / 2
            bh = (val / max_val) * plot_h
            by = origin_y

            # Bar fill
            self.current_stream.append(f"q {bar_color} rg {bx} {by} {bar_w} {bh} re f Q")
            self.current_stream.append(f"q 0.15 0.3 0.5 RG 0.5 w {bx} {by} {bar_w} {bh} re S Q")

            # Value text above bar
            self.current_stream.append(f"BT /F2 7.5 Tf 0.1 0.2 0.3 rg {bx - 2} {by + bh + 3} Td ({val}) Tj ET")

            # Label text below
            clean_lbl = lbl.replace("(", "\\(").replace(")", "\\)")
            self.current_stream.append(f"BT /F1 7.2 Tf 0.3 0.3 0.3 rg {bx - 4} {by - 12} Td ({clean_lbl}) Tj ET")

        self.current_y -= (chart_h + 12)

    def save(self):
        if self.current_stream:
            self.pages.append("\n".join(self.current_stream))
        
        objects = []
        def write_obj(content):
            objects.append(content)
            return len(objects)

        write_obj("<< /Type /Catalog /Pages 2 0 R >>")
        write_obj("") # 2: Pages
        write_obj("<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> /F3 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >> /F4 << /Type /Font /Subtype /Type1 /BaseFont /Courier >> >> >>")

        page_refs = []
        for p_idx, stream_text in enumerate(self.pages):
            stream_bytes = stream_text.encode('latin1', 'replace')
            s_num = write_obj(f"<< /Length {len(stream_bytes)} >>\nstream\n" + stream_bytes.decode('latin1') + "\nendstream")
            p_num = write_obj(f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {self.width} {self.height}] /Resources 3 0 R /Contents {s_num} 0 R >>")
            page_refs.append(f"{p_num} 0 R")

        objects[1] = f"<< /Type /Pages /Kids [{' '.join(page_refs)}] /Count {len(self.pages)} >>"

        with open(self.filename, 'wb') as f:
            f.write(b"%PDF-1.4\n")
            offsets = []
            for i, obj in enumerate(objects):
                offsets.append(f.tell())
                f.write(f"{i+1} 0 obj\n{obj}\nendobj\n".encode('latin1'))
            xref_offset = f.tell()
            f.write(b"xref\n")
            f.write(f"0 {len(objects)+1}\n".encode('latin1'))
            f.write(b"0000000000 65535 f \n")
            for off in offsets:
                f.write(f"{off:010d} 00000 n \n".encode('latin1'))
            f.write(b"trailer\n")
            f.write(f"<< /Size {len(objects)+1} /Root 1 0 R >>\n".encode('latin1'))
            f.write(b"startxref\n")
            f.write(f"{xref_offset}\n%%EOF\n".encode('latin1'))

print("AcademicPDF engine defined successfully")
