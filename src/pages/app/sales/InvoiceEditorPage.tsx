import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Plus, Trash2, GripVertical, Eye, Download, Send,
  Save, FileText, ChevronDown, ChevronUp, Palette,
  Image, AlignLeft, Hash,
  PenLine, Stamp, Calendar, CreditCard, Scale,
  LayoutGrid, X, Printer, FilePlus, Settings,
  FileDown, Loader2,
  Bold, Italic, Underline, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Highlighter, Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type ColumnType = "text" | "number" | "percent" | "currency" | "computed";

interface Column {
  id: string; label: string; type: ColumnType;
  width: number; editable: boolean; visible: boolean;
  computed?: (line: InvoiceLine) => string;
}
interface InvoiceLine { id: string; [key: string]: string | number; }

type BlockType = "lines" | "observations" | "rib" | "legal" | "deposit"
  | "signature" | "stamp" | "footer" | "custom" | "extra_page";

interface Block {
  id: string; type: BlockType; label: string;
  content: string; visible: boolean; isPage?: boolean;
}
interface DesignSettings {
  primaryColor: string; secondaryColor: string; fontFamily: string;
  logoUrl: string | null; headerBg: string; showBorder: boolean;
}

// ─── CONSTANTES ───────────────────────────────────────────────────────────────

const DEFAULT_COLUMNS: Column[] = [
  { id:"designation", label:"Désignation", type:"text",     width:4, editable:true,  visible:true },
  { id:"qty",         label:"Qté",         type:"number",   width:1, editable:true,  visible:true },
  { id:"puHt",        label:"PU HT (€)",   type:"currency", width:2, editable:true,  visible:true },
  { id:"tva",         label:"TVA %",        type:"percent",  width:1, editable:true,  visible:true },
  { id:"tvaAmount",   label:"Montant TVA", type:"computed", width:2, editable:false, visible:true,
    computed: (l) => {
      const pu=parseFloat(String(l.puHt))||0, qty=parseFloat(String(l.qty))||0;
      const tva=parseFloat(String(l.tva))||0, rem=parseFloat(String(l.remise||0))/100;
      return (pu*qty*(1-rem)*tva/100).toFixed(2);
    },
  },
  { id:"ttc", label:"TTC (€)", type:"computed", width:2, editable:false, visible:true,
    computed: (l) => {
      const pu=parseFloat(String(l.puHt))||0, qty=parseFloat(String(l.qty))||0;
      const tva=parseFloat(String(l.tva))||0, rem=parseFloat(String(l.remise||0))/100;
      return (pu*qty*(1-rem)*(1+tva/100)).toFixed(2);
    },
  },
];

const OPTIONAL_COLUMNS: Column[] = [
  { id:"ref",    label:"Référence", type:"text",    width:2, editable:true, visible:false },
  { id:"remise", label:"Remise %",  type:"percent", width:1, editable:true, visible:false },
  { id:"unit",   label:"Unité",     type:"text",    width:1, editable:true, visible:false },
];

const AVAILABLE_BLOCKS: { type: BlockType; label: string; icon: any; defaultContent: string }[] = [
  { type:"observations", label:"Observations / Conditions",   icon:AlignLeft,  defaultContent:"Ex: Conditions de paiement, mentions particulières..." },
  { type:"rib",          label:"RIB / Coordonnées bancaires", icon:CreditCard, defaultContent:"Titulaire : \nIBAN : \nBIC : \nBanque : " },
  { type:"legal",        label:"Mentions légales",            icon:Scale,      defaultContent:"TVA non applicable, art. 293B du CGI\nPénalités de retard : 3x taux légal" },
  { type:"deposit",      label:"Acompte / Échéancier",        icon:Calendar,   defaultContent:"Acompte 30% à la commande\nSolde à la livraison" },
  { type:"signature",    label:"Signature électronique",      icon:PenLine,    defaultContent:"" },
  { type:"stamp",        label:"Tampon / Cachet",             icon:Stamp,      defaultContent:"" },
  { type:"footer",       label:"Pied de page personnalisé",   icon:FileText,   defaultContent:"" },
  { type:"custom",       label:"Bloc personnalisé",           icon:Settings,   defaultContent:"" },
  { type:"extra_page",   label:"Page supplémentaire",         icon:FilePlus,   defaultContent:"" },
];

const VAT_RATES   = ["0","5.5","10","20"];
const FONT_OPTIONS = [
  { label:"Moderne",   value:"'DM Sans', sans-serif" },
  { label:"Classique", value:"'Playfair Display', serif" },
  { label:"Technique", value:"'JetBrains Mono', monospace" },
  { label:"Élégant",   value:"'Cormorant Garamond', serif" },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2,10); }
function emptyLine(): InvoiceLine {
  return { id:uid(), designation:"", qty:1, puHt:0, tva:20, remise:0, ref:"", unit:"" };
}
function computeTotals(lines: InvoiceLine[]) {
  let totalHT=0, totalTVA=0;
  for (const l of lines) {
    const pu=parseFloat(String(l.puHt))||0, qty=parseFloat(String(l.qty))||0;
    const tva=parseFloat(String(l.tva))||0, rem=parseFloat(String(l.remise||0))/100;
    const ht=pu*qty*(1-rem);
    totalHT+=ht; totalTVA+=ht*tva/100;
  }
  return { totalHT, totalTVA, totalTTC:totalHT+totalTVA };
}

// ─── HOOK PARTAGÉ : save/restore sélection + execCommand ──────────────────────
function useRichEditor(onChange: (v: string) => void) {
  const editorRef  = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);
  const initialized = useRef(false);

  // Init le DOM UNE seule fois avec la valeur initiale
  // Ne jamais réécrire innerHTML pendant l'édition (casse la sélection)
  const initContent = (value: string) => {
    if (initialized.current) return;
    const el = editorRef.current;
    if (el && el.innerHTML === "" && value) {
      el.innerHTML = value;
      initialized.current = true;
    } else if (el && value === "" && !initialized.current) {
      initialized.current = true;
    }
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) savedRange.current = sel.getRangeAt(0).cloneRange();
  };

  const restoreAndFocus = () => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    if (savedRange.current) {
      const sel = window.getSelection();
      if (sel) { sel.removeAllRanges(); sel.addRange(savedRange.current); }
    }
  };

  const exec = (cmd: string, val?: string) => {
    restoreAndFocus();
    document.execCommand(cmd, false, val);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const applyFontSize = (size: string) => {
    restoreAndFocus();
    // Utiliser execCommand fontSize avec un tableau de correspondance px→1-7
    // puis remplacer les <font size="X"> par <span style="font-size:Xpx">
    const sizeMap: Record<string, string> = {
      "10":"1","11":"1","12":"2","13":"2","14":"3","16":"4","18":"5","20":"6","24":"7"
    };
    const level = sizeMap[size] || "3";
    document.execCommand("fontSize", false, level);
    // Remplacer les <font size="X"> générés par des spans avec font-size inline
    const el = editorRef.current;
    if (!el) return;
    el.querySelectorAll(`font[size="${level}"]`).forEach(node => {
      const span = document.createElement("span");
      span.style.fontSize = size + "px";
      span.innerHTML = (node as HTMLElement).innerHTML;
      node.parentNode?.replaceChild(span, node);
    });
    onChange(el.innerHTML);
  };

  const handleInput = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  return { editorRef, saveSelection, exec, applyFontSize, handleInput, initContent };
}

function RichTextArea({ value, onChange, placeholder, rows=3 }: {
  value:string; onChange:(v:string)=>void; placeholder?:string; rows?:number;
}) {
  const { editorRef, saveSelection, exec, applyFontSize, handleInput, initContent } = useRichEditor(onChange);
  const [showColors, setShowColors] = useState(false);
  const [fontSize,   setFontSize]   = useState("13");

  // Init DOM content une seule fois au montage
  useEffect(() => { initContent(value); }, []); // eslint-disable-line

  const COLORS    = ["#1a1a2e","#4f46e5","#0ea5e9","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#64748b","#ffffff"];
  const BG_COLORS = ["#fef08a","#bbf7d0","#bfdbfe","#fecaca","#e9d5ff","#fed7aa","#f1f5f9"];
  const SIZES  = ["10","11","12","13","14","16","18","20","24"];
  const [showBgColors, setShowBgColors] = useState(false);

  const ToolBtn = ({ onClick, title, children }: any) => (
    <button type="button"
      onMouseDown={e => { e.preventDefault(); saveSelection(); onClick(); }}
      title={title}
      className="h-6 w-6 rounded flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground hover:bg-muted">
      {children}
    </button>
  );

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-0.5 mb-1.5 pb-1.5 border-b border-border/40">
        <select value={fontSize}
          onMouseDown={() => saveSelection()}
          onChange={e => { setFontSize(e.target.value); applyFontSize(e.target.value); }}
          className="h-6 text-[10px] bg-background border border-border rounded px-1 mr-1 text-muted-foreground">
          {SIZES.map(s=><option key={s} value={s}>{s}px</option>)}
        </select>
        <ToolBtn onClick={()=>exec("bold")}      title="Gras">       <Bold      className="h-3 w-3"/></ToolBtn>
        <ToolBtn onClick={()=>exec("italic")}    title="Italique">   <Italic    className="h-3 w-3"/></ToolBtn>
        <ToolBtn onClick={()=>exec("underline")} title="Souligné">   <Underline className="h-3 w-3"/></ToolBtn>
        <div className="w-px h-4 bg-border/60 mx-0.5"/>
        <ToolBtn onClick={()=>exec("justifyLeft")}   title="Gauche">   <AlignLeft    className="h-3 w-3"/></ToolBtn>
        <ToolBtn onClick={()=>exec("justifyCenter")} title="Centré">   <AlignCenter  className="h-3 w-3"/></ToolBtn>
        <ToolBtn onClick={()=>exec("justifyRight")}  title="Droite">   <AlignRight   className="h-3 w-3"/></ToolBtn>
        <ToolBtn onClick={()=>exec("justifyFull")}   title="Justifié"> <AlignJustify className="h-3 w-3"/></ToolBtn>
        <div className="w-px h-4 bg-border/60 mx-0.5"/>
        <ToolBtn onClick={()=>exec("insertUnorderedList")} title="Liste à puces">   <List        className="h-3 w-3"/></ToolBtn>
        <ToolBtn onClick={()=>exec("insertOrderedList")}   title="Liste numérotée"> <ListOrdered className="h-3 w-3"/></ToolBtn>
        <div className="w-px h-4 bg-border/60 mx-0.5"/>
        <div className="relative">
          <ToolBtn onClick={()=>setShowColors(s=>!s)} title="Couleur du texte"><Type className="h-3 w-3"/></ToolBtn>
          {showColors && (
            <div className="absolute top-7 left-0 z-50 bg-card border border-border rounded-lg p-2 shadow-lg flex flex-wrap gap-1 w-28">
              {COLORS.map(c=>(
                <button key={c} type="button"
                  onMouseDown={e=>{e.preventDefault(); saveSelection(); exec("foreColor",c); setShowColors(false);}}
                  className="h-5 w-5 rounded border border-border/40 hover:scale-110 transition-transform"
                  style={{background:c}} />
              ))}
            </div>
          )}
        </div>
        <ToolBtn onClick={()=>exec("hiliteColor","#fef08a")} title="Surligner"><Highlighter className="h-3 w-3"/></ToolBtn>
        <div className="relative">
          <ToolBtn onClick={()=>{ setShowBgColors(s=>!s); setShowColors(false); }} title="Couleur de fond"><Highlighter className="h-3 w-3 opacity-60"/></ToolBtn>
          {showBgColors && (
            <div className="absolute top-7 left-0 z-50 bg-card border border-border rounded-lg p-2 shadow-lg flex flex-wrap gap-1 w-28">
              {BG_COLORS.map(c=>(
                <button key={c} type="button"
                  onMouseDown={e=>{e.preventDefault(); saveSelection(); exec("hiliteColor",c); setShowBgColors(false);}}
                  className="h-5 w-5 rounded border border-border/40 hover:scale-110 transition-transform"
                  style={{background:c}} />
              ))}
              <button type="button"
                onMouseDown={e=>{e.preventDefault(); saveSelection(); exec("hiliteColor","transparent"); setShowBgColors(false);}}
                className="h-5 w-5 rounded border border-border/40 hover:scale-110 transition-transform flex items-center justify-center text-[8px] text-muted-foreground"
                title="Supprimer fond">✕</button>
            </div>
          )}
        </div>
        <div className="w-px h-4 bg-border/60 mx-0.5"/>
        <ToolBtn onClick={()=>exec("removeFormat")} title="Effacer la mise en forme">
          <span className="text-[9px] font-bold">Aa</span>
        </ToolBtn>
      </div>
      <div ref={editorRef} contentEditable suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder}
        style={{ minHeight: `${rows * 1.6}rem` }}
        className="w-full bg-transparent text-sm text-foreground outline-none leading-relaxed
                   empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50"
      />
    </div>
  );
}

// ─── VERSION COMPACTE pour les lignes de facture ──────────────────────────────
function RichTextAreaCompact({ value, onChange, placeholder, rows=2 }: {
  value:string; onChange:(v:string)=>void; placeholder?:string; rows?:number;
}) {
  const { editorRef, saveSelection, exec, handleInput, initContent } = useRichEditor(onChange);
  const [showColors, setShowColors] = useState(false);
  const [showBgColors, setShowBgColors] = useState(false);

  useEffect(() => { initContent(value); }, []); // eslint-disable-line

  const COLORS    = ["#1a1a2e","#4f46e5","#10b981","#f59e0b","#ef4444","#64748b"];
  const BG_COLORS = ["#fef08a","#bbf7d0","#bfdbfe","#fecaca","#e9d5ff","#fed7aa"];

  const Btn = ({ onClick, title, children }: any) => (
    <button type="button"
      onMouseDown={e => { e.preventDefault(); saveSelection(); onClick(); }}
      title={title}
      className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
      {children}
    </button>
  );

  return (
    <div className="w-full">
      <div className="flex items-center gap-0.5 mb-1 pb-1 border-b border-border/30">
        <Btn onClick={()=>exec("bold")}      title="Gras">      <Bold      className="h-3 w-3"/></Btn>
        <Btn onClick={()=>exec("italic")}    title="Italique">  <Italic    className="h-3 w-3"/></Btn>
        <Btn onClick={()=>exec("underline")} title="Souligné">  <Underline className="h-3 w-3"/></Btn>
        <div className="w-px h-3 bg-border/60 mx-0.5"/>
        <Btn onClick={()=>exec("justifyLeft")}   title="Gauche">  <AlignLeft   className="h-3 w-3"/></Btn>
        <Btn onClick={()=>exec("justifyCenter")} title="Centré">  <AlignCenter className="h-3 w-3"/></Btn>
        <Btn onClick={()=>exec("justifyRight")}  title="Droite">  <AlignRight  className="h-3 w-3"/></Btn>
        <div className="w-px h-3 bg-border/60 mx-0.5"/>
        <Btn onClick={()=>exec("insertUnorderedList")} title="Puces">   <List        className="h-3 w-3"/></Btn>
        <Btn onClick={()=>exec("insertOrderedList")}   title="Numéros"> <ListOrdered className="h-3 w-3"/></Btn>
        <div className="w-px h-3 bg-border/60 mx-0.5"/>
        <div className="relative">
          <Btn onClick={()=>setShowColors(s=>!s)} title="Couleur texte"><Type className="h-3 w-3"/></Btn>
          {showColors && (
            <div className="absolute top-6 left-0 z-50 bg-card border border-border rounded-lg p-1.5 shadow-lg flex gap-1">
              {COLORS.map(c=>(
                <button key={c} type="button"
                  onMouseDown={e=>{e.preventDefault(); saveSelection(); exec("foreColor",c); setShowColors(false);}}
                  className="h-4 w-4 rounded border border-border/40 hover:scale-110 transition-transform"
                  style={{background:c}} />
              ))}
            </div>
          )}
        </div>
        <div className="relative">
          <Btn onClick={()=>setShowBgColors(s=>!s)} title="Couleur fond"><Highlighter className="h-3 w-3"/></Btn>
          {showBgColors && (
            <div className="absolute top-6 left-0 z-50 bg-card border border-border rounded-lg p-1.5 shadow-lg flex gap-1 flex-wrap w-24">
              {BG_COLORS.map(c=>(
                <button key={c} type="button"
                  onMouseDown={e=>{e.preventDefault(); saveSelection(); exec("hiliteColor",c); setShowBgColors(false);}}
                  className="h-4 w-4 rounded border border-border/40 hover:scale-110 transition-transform"
                  style={{background:c}} />
              ))}
              <button type="button"
                onMouseDown={e=>{e.preventDefault(); saveSelection(); exec("hiliteColor","transparent"); setShowBgColors(false);}}
                className="h-4 w-4 rounded border border-border/40 flex items-center justify-center text-[7px] text-muted-foreground"
                title="Supprimer fond">✕</button>
            </div>
          )}
        </div>
      </div>
      <div ref={editorRef} contentEditable suppressContentEditableWarning
        onInput={handleInput} data-placeholder={placeholder}
        style={{ minHeight:`${rows*1.5}rem` }}
        className="w-full bg-transparent text-sm text-foreground outline-none leading-relaxed
                   empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50" />
    </div>
  );
}
// Représente une "page A4" dans l'aperçu, avec numérotation

interface PdfPageProps {
  pageNum: number; totalPages: number; isFirst: boolean;
  invoiceNumber: string; design: DesignSettings;
  sellerInfo: string; children: React.ReactNode;
  footerContent?: string;
}

function PdfPage({ pageNum, totalPages, isFirst, invoiceNumber, design, sellerInfo, children, footerContent }: PdfPageProps) {
  return (
    <div className="w-full bg-white mb-4 shadow-lg overflow-hidden"
      style={{ fontFamily: design.fontFamily, color:"#1a1a2e", minHeight:1050, position:"relative",
               pageBreakAfter: pageNum < totalPages ? "always" : "auto" }}>

      {/* En-tête page 2+ */}
      {!isFirst && (
        <div className="px-6 py-3 border-b-2 flex justify-between items-center"
          style={{ backgroundColor: design.headerBg, borderColor: design.primaryColor+"40" }}>
          <div className="text-[10px] font-semibold" style={{ color: design.primaryColor }}>
            Suite de la Facture N° {invoiceNumber}
          </div>
          <div className="text-[9px] text-gray-400">Page {pageNum} / {totalPages}</div>
        </div>
      )}

      {/* Contenu */}
      <div style={{ paddingBottom: 40 }}>{children}</div>

      {/* Numéro de page en bas */}
      <div className="absolute bottom-0 left-0 right-0 px-6 py-2 flex justify-between items-center border-t border-gray-100 text-[9px] text-gray-400">
        <span>{footerContent || `Document généré par M7Sept • Facture électronique conforme Factur-X`}</span>
        <span>Page {pageNum} / {totalPages}</span>
      </div>
    </div>
  );
}

// ─── APERÇU PDF COMPLET ───────────────────────────────────────────────────────

// Hauteur estimée de la page 1 (en px à 96dpi, A4 = ~1122px)
// Header + client + titre + en-tête tableau + totaux + blocs ≈ 520px
// Chaque ligne de tableau ≈ 36px
// Footer ≈ 30px
// → Lignes max sur page 1 ≈ (1122 - 520 - 30) / 36 ≈ 16
// → Lignes max sur pages suivantes ≈ (1122 - 70 - 30) / 36 ≈ 28
const ROWS_PAGE_1  = 15;
const ROWS_PER_PAGE = 26;

function PdfPreview({ title, lines, columns, blocks, design, invoiceNumber, issueDate, dueDate, sellerInfo, buyerInfo }: {
  title:string; lines:InvoiceLine[]; columns:Column[]; blocks:Block[];
  design:DesignSettings; invoiceNumber:string; issueDate:string; dueDate:string;
  sellerInfo:string; buyerInfo:string;
}) {
  const { totalHT, totalTVA, totalTTC } = computeTotals(lines);
  const visibleCols  = columns.filter(c => c.visible);
  const mainBlocks   = blocks.filter(b => b.visible && b.type !== "lines" && b.type !== "extra_page" && b.type !== "footer" && b.type !== "custom");
  const extraPages   = blocks.filter(b => b.visible && b.type === "extra_page");
  const customBlocks = blocks.filter(b => b.visible && b.type === "custom");
  const footerBlock  = blocks.find(b => b.type === "footer" && b.visible);

  // ── Découper les lignes en pages ────────────────────────────────────────────
  const linePages: InvoiceLine[][] = [];
  if (lines.length <= ROWS_PAGE_1) {
    linePages.push(lines);
  } else {
    linePages.push(lines.slice(0, ROWS_PAGE_1));
    let offset = ROWS_PAGE_1;
    while (offset < lines.length) {
      linePages.push(lines.slice(offset, offset + ROWS_PER_PAGE));
      offset += ROWS_PER_PAGE;
    }
  }

  const tableContinuationPages = linePages.length - 1; // pages 2..N pour le tableau
  const totalPages = linePages.length + extraPages.length;

  // ── Composant tableau réutilisable ──────────────────────────────────────────
  const TableRows = ({ rows }: { rows: InvoiceLine[] }) => (
    <tbody>
      {rows.map((line, i) => (
        <tr key={line.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
          {visibleCols.map(col => (
            <td key={col.id} className="py-2 px-2 text-gray-700 border-b border-gray-100" style={{ fontSize: "11px" }}>
              {col.id === "tvaAmount" && col.computed ? (
                <span>{col.computed(line)} € <span className="text-[9px] text-gray-400">({line.tva}%)</span></span>
              ) : col.computed ? `${col.computed(line)} €` : col.type === "text" ? (
                <div className="leading-relaxed" dangerouslySetInnerHTML={{ __html: String(line[col.id] ?? "") }} />
              ) : (
                <>
                  {String(line[col.id] ?? "")}
                  {col.type === "percent" && line[col.id] ? "%" : ""}
                  {col.type === "currency" && line[col.id] ? " €" : ""}
                </>
              )}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );

  const TableHead = () => (
    <thead>
      <tr style={{ backgroundColor: design.primaryColor + "15" }}>
        {visibleCols.map(col => (
          <th key={col.id} className="py-2 px-2 text-left text-[9px] uppercase tracking-wider font-semibold"
            style={{ color: design.primaryColor, width: `${col.width * 8}%` }}>
            {col.label}
            {col.id === "tvaAmount" && <span className="text-[8px] opacity-60 block normal-case">(taux × base HT)</span>}
          </th>
        ))}
      </tr>
    </thead>
  );

  return (
    <div className="space-y-0" id="pdf-preview-root">

      {/* ── PAGE 1 ── */}
      <PdfPage pageNum={1} totalPages={totalPages} isFirst invoiceNumber={invoiceNumber}
        design={design} sellerInfo={sellerInfo} footerContent={footerBlock?.content}>

        {/* Header */}
        <div className="p-6" style={{ backgroundColor: design.headerBg }}>
          <div className="flex justify-between items-start">
            <div>
              {design.logoUrl
                ? <img src={design.logoUrl} alt="Logo" className="h-12 mb-2 object-contain"/>
                : <div className="h-10 w-24 rounded-lg mb-2 flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: design.primaryColor }}>LOGO</div>
              }
              <div className="text-[10px] text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: sellerInfo || "" }} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold mb-1" style={{ color: design.primaryColor }}>FACTURE</div>
              <div className="text-gray-500 text-[10px] space-y-0.5">
                <div><span className="font-semibold">N° </span>{invoiceNumber || "2025-0001"}</div>
                <div><span className="font-semibold">Date : </span>{issueDate || "—"}</div>
                <div><span className="font-semibold">Échéance : </span>{dueDate || "—"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Client */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-end">
          <div className="w-64 rounded-lg p-3" style={{ backgroundColor: design.headerBg }}>
            <div className="text-[9px] uppercase tracking-widest mb-1" style={{ color: design.primaryColor }}>Facturé à</div>
            <div className="text-[11px] font-semibold text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: buyerInfo || "Nom du client<br/>Adresse<br/>SIRET : " }} />
          </div>
        </div>

        {/* Titre */}
        {title && (
          <div className="px-6 py-3 border-b border-gray-100">
            <div className="font-semibold text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: title }} />
          </div>
        )}

        {/* Tableau page 1 */}
        <div className="px-6 py-4">
          <table className="w-full border-collapse">
            <TableHead />
            <TableRows rows={linePages[0]} />
          </table>
          {linePages.length > 1 && (
            <div className="text-[9px] text-gray-400 italic mt-2 text-right">Suite page suivante →</div>
          )}
        </div>

        {/* Totaux seulement si tout le tableau tient sur la page 1 */}
        {linePages.length === 1 && (
          <div className="px-6 pb-4 flex justify-end">
            <div className="w-56 space-y-1">
              {[{ label:"Total HT", val:totalHT.toFixed(2) }, { label:"TVA", val:totalTVA.toFixed(2) }].map(r => (
                <div key={r.label} className="flex justify-between text-gray-600 py-1 border-b border-gray-100">
                  <span>{r.label}</span><span className="font-medium">{r.val} €</span>
                </div>
              ))}
              <div className="flex justify-between py-2 px-2 rounded-lg font-bold text-white text-sm mt-1"
                style={{ backgroundColor: design.primaryColor }}>
                <span>Total TTC</span><span>{totalTTC.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        )}

        {/* Blocs principaux seulement si tout le tableau tient sur page 1 */}
        {linePages.length === 1 && mainBlocks.map(block => (
          <div key={block.id} className="px-6 py-3 border-t border-gray-100">
            <div className="text-[9px] uppercase tracking-widest mb-1 font-semibold" style={{ color: design.primaryColor }}>
              {block.label}
            </div>
            {block.type === "signature" ? (
              <div className="h-16 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-300 text-[10px]">
                Signature électronique
              </div>
            ) : block.type === "stamp" ? (
              <div className="h-16 w-16 border-2 border-dashed border-gray-200 rounded-full flex items-center justify-center text-gray-300 text-[9px] text-center">
                Tampon
              </div>
            ) : (
              <div className="text-[10px] text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: block.content }} />
            )}
          </div>
        ))}

        {linePages.length === 1 && customBlocks.map(block => (
          <div key={block.id} className="px-6 py-3 border-t border-gray-100">
            <div className="text-[9px] uppercase tracking-widest mb-1 font-semibold" style={{ color: design.primaryColor }}>
              {block.label}
            </div>
            <div className="text-[10px] text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: block.content }} />
          </div>
        ))}
      </PdfPage>

      {/* ── PAGES CONTINUATION TABLEAU (2..N) ── */}
      {linePages.slice(1).map((pageLines, idx) => {
        const pageNum = idx + 2;
        const isLastTablePage = idx === linePages.length - 2;
        return (
          <PdfPage key={`table-page-${pageNum}`} pageNum={pageNum} totalPages={totalPages} isFirst={false}
            invoiceNumber={invoiceNumber} design={design} sellerInfo={sellerInfo} footerContent={footerBlock?.content}>
            <div className="px-6 py-4">
              <div className="text-[9px] uppercase tracking-widest mb-2 font-semibold" style={{ color: design.primaryColor }}>
                Suite des lignes
              </div>
              <table className="w-full border-collapse">
                <TableHead />
                <TableRows rows={pageLines} />
              </table>
              {!isLastTablePage && (
                <div className="text-[9px] text-gray-400 italic mt-2 text-right">Suite page suivante →</div>
              )}
            </div>

            {/* Totaux et blocs sur la dernière page du tableau */}
            {isLastTablePage && (
              <>
                <div className="px-6 pb-4 flex justify-end">
                  <div className="w-56 space-y-1">
                    {[{ label:"Total HT", val:totalHT.toFixed(2) }, { label:"TVA", val:totalTVA.toFixed(2) }].map(r => (
                      <div key={r.label} className="flex justify-between text-gray-600 py-1 border-b border-gray-100">
                        <span>{r.label}</span><span className="font-medium">{r.val} €</span>
                      </div>
                    ))}
                    <div className="flex justify-between py-2 px-2 rounded-lg font-bold text-white text-sm mt-1"
                      style={{ backgroundColor: design.primaryColor }}>
                      <span>Total TTC</span><span>{totalTTC.toFixed(2)} €</span>
                    </div>
                  </div>
                </div>
                {mainBlocks.map(block => (
                  <div key={block.id} className="px-6 py-3 border-t border-gray-100">
                    <div className="text-[9px] uppercase tracking-widest mb-1 font-semibold" style={{ color: design.primaryColor }}>
                      {block.label}
                    </div>
                    {block.type === "signature" ? (
                      <div className="h-16 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-300 text-[10px]">Signature électronique</div>
                    ) : block.type === "stamp" ? (
                      <div className="h-16 w-16 border-2 border-dashed border-gray-200 rounded-full flex items-center justify-center text-gray-300 text-[9px] text-center">Tampon</div>
                    ) : (
                      <div className="text-[10px] text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: block.content }} />
                    )}
                  </div>
                ))}
                {customBlocks.map(block => (
                  <div key={block.id} className="px-6 py-3 border-t border-gray-100">
                    <div className="text-[9px] uppercase tracking-widest mb-1 font-semibold" style={{ color: design.primaryColor }}>{block.label}</div>
                    <div className="text-[10px] text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: block.content }} />
                  </div>
                ))}
              </>
            )}
          </PdfPage>
        );
      })}

      {/* ── PAGES SUPPLÉMENTAIRES manuelles ── */}
      {extraPages.map((page, idx) => (
        <PdfPage key={page.id} pageNum={linePages.length + idx + 1} totalPages={totalPages} isFirst={false}
          invoiceNumber={invoiceNumber} design={design} sellerInfo={sellerInfo} footerContent={footerBlock?.content}>
          <div className="px-6 py-6">
            <div className="text-[11px] text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: page.content || "Contenu de la page supplémentaire..." }} />
          </div>
        </PdfPage>
      ))}
    </div>
  );
}

// ─── CHAMP TEXTE SIMPLE contentEditable (sans toolbar propre) ────────────────
// Utilisé pour les cellules du tableau — la toolbar globale s'y applique
function SimpleEditable({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isUpdating = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || isUpdating.current) return;
    if (el.innerHTML !== value) el.innerHTML = value;
  }, [value]);

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={() => {
        isUpdating.current = true;
        onChange(ref.current?.innerHTML ?? "");
        setTimeout(() => { isUpdating.current = false; }, 0);
      }}
      data-placeholder={placeholder}
      className="w-full min-h-[2rem] px-2 py-1 text-sm text-foreground outline-none leading-relaxed
                 border border-border/50 rounded-lg bg-muted/10
                 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50"
    />
  );
}

// ─── TOOLBAR GLOBALE pour tout le tableau des lignes ─────────────────────────
// S'applique à n'importe quelle cellule contentEditable focalisée
function LinesFormattingToolbar() {
  const [showColors,  setShowColors]  = useState(false);
  const [showBgColors,setShowBgColors]= useState(false);
  const [fontSize,    setFontSize]    = useState("13");
  // Sauvegarde de la sélection avant que le bouton prenne le focus
  const savedRange = useRef<Range | null>(null);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) savedRange.current = sel.getRangeAt(0).cloneRange();
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (sel && savedRange.current) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
  };

  const exec = (cmd: string, val?: string) => {
    restoreSelection();
    document.execCommand(cmd, false, val);
  };

  const applyFontSize = (size: string) => {
    setFontSize(size);
    restoreSelection();
    const sizeMap: Record<string, string> = {
      "10":"1","11":"1","12":"2","13":"2","14":"3","16":"4","18":"5","20":"6","24":"7"
    };
    const level = sizeMap[size] || "3";
    document.execCommand("fontSize", false, level);
    // Remplacer <font size="X"> par <span style="font-size:Xpx">
    document.querySelectorAll(`[contenteditable] font[size="${level}"]`).forEach(node => {
      const span = document.createElement("span");
      span.style.fontSize = size + "px";
      span.innerHTML = (node as HTMLElement).innerHTML;
      node.parentNode?.replaceChild(span, node);
    });
  };

  const COLORS    = ["#1a1a2e","#4f46e5","#0ea5e9","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#64748b","#000000"];
  const BG_COLORS = ["#fef08a","#bbf7d0","#bfdbfe","#fecaca","#e9d5ff","#fed7aa","#f1f5f9","#ffffff"];
  const SIZES     = ["10","11","12","13","14","16","18","20","24"];

  const Btn = ({ onClick, title, children }: any) => (
    <button type="button"
      onMouseDown={e => { e.preventDefault(); saveSelection(); onClick(); }}
      title={title}
      className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0">
      {children}
    </button>
  );
  const Sep = () => <div className="w-px h-4 bg-border/50 mx-0.5 flex-shrink-0" />;

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-muted/20 rounded-lg border border-border/40">
      <select value={fontSize}
        onMouseDown={() => saveSelection()}
        onChange={e => applyFontSize(e.target.value)}
        className="h-6 text-[10px] bg-background border border-border rounded px-1 mr-1 text-muted-foreground flex-shrink-0">
        {SIZES.map(s => <option key={s} value={s}>{s}px</option>)}
      </select>

      <Btn onClick={() => exec("bold")}          title="Gras">       <Bold      className="h-3 w-3"/></Btn>
      <Btn onClick={() => exec("italic")}        title="Italique">   <Italic    className="h-3 w-3"/></Btn>
      <Btn onClick={() => exec("underline")}     title="Souligné">   <Underline className="h-3 w-3"/></Btn>
      <Btn onClick={() => exec("strikeThrough")} title="Barré">
        <span className="text-[10px] font-bold line-through">S</span>
      </Btn>
      <Sep/>
      <Btn onClick={() => exec("justifyLeft")}   title="Gauche">   <AlignLeft    className="h-3 w-3"/></Btn>
      <Btn onClick={() => exec("justifyCenter")} title="Centré">   <AlignCenter  className="h-3 w-3"/></Btn>
      <Btn onClick={() => exec("justifyRight")}  title="Droite">   <AlignRight   className="h-3 w-3"/></Btn>
      <Btn onClick={() => exec("justifyFull")}   title="Justifié"> <AlignJustify className="h-3 w-3"/></Btn>
      <Sep/>
      <Btn onClick={() => exec("insertUnorderedList")} title="Puces">    <List        className="h-3 w-3"/></Btn>
      <Btn onClick={() => exec("insertOrderedList")}   title="Numéros">  <ListOrdered className="h-3 w-3"/></Btn>
      <Btn onClick={() => exec("indent")}  title="Retrait +"><span className="text-[10px] font-mono">→</span></Btn>
      <Btn onClick={() => exec("outdent")} title="Retrait -"><span className="text-[10px] font-mono">←</span></Btn>
      <Sep/>
      <div className="relative">
        <Btn onClick={() => { setShowColors(s=>!s); setShowBgColors(false); }} title="Couleur texte">
          <Type className="h-3 w-3"/>
        </Btn>
        {showColors && (
          <div className="absolute top-7 left-0 z-50 bg-card border border-border rounded-lg p-2 shadow-lg flex flex-wrap gap-1 w-28">
            {COLORS.map(c => (
              <button key={c} type="button"
                onMouseDown={e => { e.preventDefault(); exec("foreColor", c); setShowColors(false); }}
                className="h-5 w-5 rounded border border-border/40 hover:scale-110 transition-transform"
                style={{ background: c }} />
            ))}
          </div>
        )}
      </div>
      <div className="relative">
        <Btn onClick={() => { setShowBgColors(s=>!s); setShowColors(false); }} title="Couleur fond">
          <Highlighter className="h-3 w-3"/>
        </Btn>
        {showBgColors && (
          <div className="absolute top-7 left-0 z-50 bg-card border border-border rounded-lg p-2 shadow-lg flex flex-wrap gap-1 w-28">
            {BG_COLORS.map(c => (
              <button key={c} type="button"
                onMouseDown={e => { e.preventDefault(); exec("hiliteColor", c); setShowBgColors(false); }}
                className="h-5 w-5 rounded border border-border/40 hover:scale-110 transition-transform"
                style={{ background: c }} />
            ))}
          </div>
        )}
      </div>
      <Sep/>
      <Btn onClick={() => exec("removeFormat")} title="Effacer la mise en forme">
        <span className="text-[9px] font-bold">Aa↺</span>
      </Btn>
    </div>
  );
}

// ─── PAGE PRINCIPALE ──────────────────────────────────────────────────────────

export default function InvoiceEditorPage() {
  const [title,         setTitle]         = useState("");
  const [lines,         setLines]         = useState<InvoiceLine[]>([emptyLine()]);
  const [columns,       setColumns]       = useState<Column[]>(DEFAULT_COLUMNS);
  const [blocks,        setBlocks]        = useState<Block[]>([]);
  const [design,        setDesign]        = useState<DesignSettings>({
    primaryColor:"#6d28d9", secondaryColor:"#ede9fe",
    fontFamily:"'DM Sans', sans-serif", logoUrl:null, headerBg:"#f5f3ff", showBorder:true,
  });
  const [invoiceNumber, setInvoiceNumber] = useState("2025-0001");
  const [issueDate,     setIssueDate]     = useState(new Date().toISOString().slice(0,10));
  const [dueDate,       setDueDate]       = useState("");
  const [sellerInfo,    setSellerInfo]    = useState("");
  const [buyerInfo,     setBuyerInfo]     = useState("");
  const [showDesign,    setShowDesign]    = useState(false);
  const [showColMenu,   setShowColMenu]   = useState(false);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [expandedLines, setExpandedLines] = useState<Set<string>>(new Set());
  const [newColLabel,   setNewColLabel]   = useState("");
  const [isPdfLoading,  setIsPdfLoading]  = useState(false);

  // Pour les blocs custom — nom personnalisé
  const [pendingCustomLabel, setPendingCustomLabel] = useState("");
  const [showCustomLabelInput, setShowCustomLabelInput] = useState(false);

  const { totalHT, totalTVA, totalTTC } = computeTotals(lines);

  // ── Lignes ──────────────────────────────────────────────────────────────────
  const addLine    = () => setLines(l => [...l, emptyLine()]);
  const removeLine = (id:string) => setLines(l => l.filter(x => x.id!==id));
  const updateLine = (id:string, field:string, value:string|number) =>
    setLines(l => l.map(x => x.id===id ? {...x,[field]:value} : x));
  const toggleExpand = (id:string) =>
    setExpandedLines(s => { const n=new Set(s); n.has(id)?n.delete(id):n.add(id); return n; });

  // ── Colonnes ─────────────────────────────────────────────────────────────
  const toggleColumn = (colId:string) =>
    setColumns(c => c.map(col => col.id===colId ? {...col, visible:!col.visible} : col));

  const addCustomColumn = () => {
    if (!newColLabel.trim()) return;
    const newCol:Column = { id:uid(), label:newColLabel.trim(), type:"text", width:2, editable:true, visible:true };
    setColumns(c => [...c.slice(0,-1), newCol, c[c.length-1]]);
    setNewColLabel("");
  };
  const removeCustomColumn = (id:string) => {
    if (DEFAULT_COLUMNS.find(c=>c.id===id)) return;
    setColumns(c => c.filter(col=>col.id!==id));
  };

  // ── Blocs ─────────────────────────────────────────────────────────────────
  const addBlock = (type: BlockType, customLabel?: string) => {
    const def = AVAILABLE_BLOCKS.find(b=>b.type===type);
    if (!def) return;
    // Autoriser plusieurs blocs custom et extra_page
    if (type !== "custom" && type !== "extra_page" && blocks.find(b=>b.type===type)) return;
    const label = customLabel || (type==="custom" ? "Bloc personnalisé" : type==="footer" ? "Pied de page" : def.label);
    const pageNum = blocks.filter(b=>b.type==="extra_page").length + 2;
    const extraLabel = type==="extra_page" ? `Page supplémentaire ${pageNum}` : label;
    setBlocks(b => [...b, { id:uid(), type, label:extraLabel, content:def.defaultContent, visible:true, isPage:type==="extra_page" }]);
    setShowBlockMenu(false);
    setShowCustomLabelInput(false);
    setPendingCustomLabel("");
  };

  const updateBlock = (id:string, content:string) =>
    setBlocks(b => b.map(x => x.id===id ? {...x,content} : x));
  const updateBlockLabel = (id:string, label:string) =>
    setBlocks(b => b.map(x => x.id===id ? {...x,label} : x));
  const removeBlock = (id:string) => setBlocks(b => b.filter(x=>x.id!==id));

  const visibleColumns     = columns.filter(c=>c.visible);
  const availableBlockTypes = AVAILABLE_BLOCKS.filter(ab =>
    ab.type==="custom" || ab.type==="extra_page" || !blocks.find(b=>b.type===ab.type)
  );

  // ── GÉNÉRATION PDF ─────────────────────────────────────────────────────────
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownloadPdf = useCallback(async () => {
    setIsPdfLoading(true);
    try {
      const element = document.getElementById("pdf-preview-root");
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData   = canvas.toDataURL("image/png");
      const pdf       = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" });
      const pdfWidth  = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pageH     = pdf.internal.pageSize.getHeight();

      let yPos = 0;
      while (yPos < pdfHeight) {
        if (yPos > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, -yPos, pdfWidth, pdfHeight);
        yPos += pageH;
      }

      pdf.save(`Facture-${invoiceNumber || "M7Sept"}.pdf`);
    } catch (err) {
      console.error("PDF error, fallback to print:", err);
      window.print();
    } finally {
      setIsPdfLoading(false);
    }
  }, [invoiceNumber]);

  // ── APERÇU IMPRESSION ──────────────────────────────────────────────────────
  // CSS print injecté dans le head pour `window.print()`
  const printStyle = `
    @media print {
      body > *:not(#print-invoice) { display: none !important; }
      #print-invoice { display: block !important; position: fixed; top:0; left:0; width:100%; }
      #pdf-preview-root { box-shadow: none !important; }
      .pdf-page { page-break-after: always; }
    }
  `;

  return (
    <div className="min-h-screen bg-background">
      {/* CSS print */}
      <style>{printStyle}</style>

      {/* ── TOOLBAR ─────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-border/60 px-4 py-2.5 flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
          <Save className="h-3.5 w-3.5" />Sauvegarder
        </Button>

        <div className="h-4 w-px bg-border/60" />

        {/* ── Bouton télécharger PDF ── */}
        <Button size="sm" className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={handleDownloadPdf} disabled={isPdfLoading}>
          {isPdfLoading
            ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Génération…</>
            : <><FileDown className="h-3.5 w-3.5" />Télécharger PDF</>
          }
        </Button>

        {/* ── Imprimer ── */}
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={handlePrint}>
          <Printer className="h-3.5 w-3.5" />Imprimer
        </Button>

        <div className="flex-1" />

        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"
          onClick={() => setShowDesign(!showDesign)}>
          <Palette className="h-3.5 w-3.5" />Design
        </Button>

        <Button className="h-8 text-xs gap-1.5 gradient-primary text-primary-foreground">
          <Send className="h-3.5 w-3.5" />Envoyer au client
        </Button>
      </div>

      {/* ── PANNEAU DESIGN ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showDesign && (
        <motion.div initial={{ height:0,opacity:0 }} animate={{ height:"auto",opacity:1 }}
            exit={{ height:0,opacity:0 }}
            className="bg-card border-b border-border/60 px-4 py-3 flex flex-wrap gap-4 items-center">
            {/* Couleur principale */}
            <div className="flex items-center gap-2">
              <Label className="text-xs">Couleur principale</Label>
              <input type="color" value={design.primaryColor}
                onChange={e => setDesign(d => ({...d, primaryColor:e.target.value, headerBg:e.target.value+"18"}))}
                className="h-7 w-10 rounded cursor-pointer border border-border" />
            </div>
            {/* Couleur secondaire */}
            <div className="flex items-center gap-2">
              <Label className="text-xs">Couleur secondaire</Label>
              <input type="color" value={design.secondaryColor}
                onChange={e => setDesign(d => ({...d, secondaryColor:e.target.value}))}
                className="h-7 w-10 rounded cursor-pointer border border-border" />
            </div>
            {/* Police */}
            <div className="flex items-center gap-2">
              <Label className="text-xs">Police</Label>
              <select value={design.fontFamily}
                onChange={e => setDesign(d => ({...d, fontFamily:e.target.value}))}
                className="h-7 text-xs bg-background border border-border rounded px-2">
                {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            {/* Bordure */}
            <div className="flex items-center gap-2">
              <Label className="text-xs">Bordure</Label>
              <button type="button"
                onClick={() => setDesign(d => ({...d, showBorder:!d.showBorder}))}
                className={`h-7 px-3 rounded text-xs border transition-colors ${design.showBorder ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}>
                {design.showBorder ? "Activée" : "Désactivée"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LAYOUT ──────────────────────────────────────────────────────────── */}
      <div className="flex gap-0 h-[calc(100vh-48px)]">

        {/* ════ ÉDITEUR GAUCHE ════════════════════════════════════════════════ */}
        <div className="w-1/2 overflow-y-auto border-r border-border/60 p-5 space-y-5">

          {/* Infos facture + Logo */}
          <div className="grid grid-cols-4 gap-3 items-end">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">N° Facture</Label>
              <Input value={invoiceNumber} onChange={e=>setInvoiceNumber(e.target.value)} className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Date émission</Label>
              <Input type="date" value={issueDate} onChange={e=>setIssueDate(e.target.value)} className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Date échéance</Label>
              <Input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Logo</Label>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="h-8 text-xs flex-1"
                  onClick={() => { const i=document.createElement("input"); i.type="file"; i.accept="image/*";
                    i.onchange=e=>{ const f=(e.target as HTMLInputElement).files?.[0]; if(!f) return;
                      const r=new FileReader(); r.onload=ev=>setDesign(d=>({...d,logoUrl:ev.target?.result as string})); r.readAsDataURL(f); };
                    i.click(); }}>
                  <Image className="h-3 w-3 mr-1" />{design.logoUrl ? "Changer" : "Importer"}
                </Button>
                {design.logoUrl && (
                  <button type="button" onClick={() => setDesign(d=>({...d,logoUrl:null}))}
                    className="h-8 w-8 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors border border-border/50">
                    <X className="h-3.5 w-3.5"/>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Vendeur / Acheteur */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Vos coordonnées</Label>
              <div className="border border-border/60 rounded-lg p-3 bg-muted/20">
                <RichTextArea value={sellerInfo} onChange={setSellerInfo}
                  placeholder={"Nom / Raison sociale\nAdresse\nSIRET : \nTVA : "} rows={4} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Client</Label>
              <div className="border border-border/60 rounded-lg p-3 bg-muted/20">
                <RichTextArea value={buyerInfo} onChange={setBuyerInfo}
                  placeholder={"Nom du client\nAdresse\nSIRET : "} rows={4} />
              </div>
            </div>
          </div>

          {/* Titre */}
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Titre de la prestation</Label>
            <div className="border border-border/60 rounded-lg p-3 bg-muted/20">
              <RichTextArea value={title} onChange={setTitle}
                placeholder="Ex: Prestation VTC mensuelle — Janvier 2026" rows={2} />
            </div>
          </div>

          {/* ── TABLEAU LIGNES ──────────────────────────────────────────────── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Lignes</Label>
              <div className="flex items-center gap-2">

                {/* Menu colonnes */}
                <div className="relative">
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1"
                    onClick={()=>setShowColMenu(!showColMenu)}>
                    <LayoutGrid className="h-3 w-3" />Colonnes
                  </Button>
                  <AnimatePresence>
                    {showColMenu && (
                      <motion.div initial={{ opacity:0,y:-4 }} animate={{ opacity:1,y:0 }}
                        exit={{ opacity:0,y:-4 }}
                        className="absolute right-0 top-8 z-50 bg-card border border-border rounded-xl shadow-xl p-3 w-72 space-y-2">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Colonnes</p>
                          <button onClick={()=>setShowColMenu(false)}
                            className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <Reorder.Group axis="y" values={columns} onReorder={setColumns} className="space-y-1">
                          {columns.map(col => (
                            <Reorder.Item key={col.id} value={col}>
                              <div className="flex items-center gap-2 py-1 px-1 rounded-lg hover:bg-muted/50 group">
                                <button className="cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground flex-shrink-0">
                                  <GripVertical className="h-3.5 w-3.5" />
                                </button>
                                <label className="flex items-center gap-2 flex-1 cursor-pointer">
                                  <input type="checkbox" checked={col.visible} onChange={()=>toggleColumn(col.id)} className="accent-primary rounded" />
                                  <span className="text-xs">{col.label}</span>
                                  {col.id==="tvaAmount"&&<span className="text-[9px] text-muted-foreground">(taux+€)</span>}
                                </label>
                                {!DEFAULT_COLUMNS.find(d=>d.id===col.id)&&!OPTIONAL_COLUMNS.find(o=>o.id===col.id)&&(
                                  <button onClick={()=>removeCustomColumn(col.id)}
                                    className="opacity-0 group-hover:opacity-100 text-destructive transition-opacity">
                                    <X className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            </Reorder.Item>
                          ))}
                        </Reorder.Group>
                        {OPTIONAL_COLUMNS.filter(o=>!columns.find(c=>c.id===o.id)).length>0&&(
                          <div className="border-t border-border/40 pt-2">
                            <p className="text-[10px] text-muted-foreground mb-1">Ajouter</p>
                            {OPTIONAL_COLUMNS.filter(o=>!columns.find(c=>c.id===o.id)).map(col=>(
                              <button key={col.id}
                                onClick={()=>setColumns(c=>[...c.slice(0,-1),{...col,visible:true},c[c.length-1]])}
                                className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg hover:bg-muted text-xs text-muted-foreground hover:text-foreground transition-colors">
                                <Plus className="h-3 w-3" />{col.label}
                              </button>
                            ))}
                          </div>
                        )}
                        <div className="border-t border-border/60 pt-2 space-y-1.5">
                          <p className="text-[10px] text-muted-foreground">Colonne personnalisée</p>
                          <div className="flex gap-1">
                            <Input value={newColLabel} onChange={e=>setNewColLabel(e.target.value)}
                              placeholder="Nom..." className="h-7 text-xs flex-1"
                              onKeyDown={e=>e.key==="Enter"&&addCustomColumn()} />
                            <Button size="sm" className="h-7 text-xs px-2" onClick={addCustomColumn}><Plus className="h-3 w-3" /></Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Button size="sm" className="h-7 text-xs gap-1 gradient-primary text-primary-foreground" onClick={addLine}>
                  <Plus className="h-3 w-3" />Ligne
                </Button>
              </div>
            </div>

            {/* ── Toolbar mise en forme globale lignes ───────────────────── */}
            <LinesFormattingToolbar />

            {/* En-têtes */}
            <div className="flex items-center gap-1 px-2 py-1.5 bg-muted/30 rounded-lg border border-border/40">
              <div className="w-5"/>
              {visibleColumns.map(col=>(
                <div key={col.id} className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold truncate"
                  style={{ flex:col.width }}>{col.label}</div>
              ))}
              <div className="w-14"/>
            </div>

            {/* Lignes */}
            <Reorder.Group axis="y" values={lines} onReorder={setLines} className="space-y-1.5">
              {lines.map(line=>(
                <Reorder.Item key={line.id} value={line}>
                  <motion.div layout className="border border-border/60 rounded-xl bg-card overflow-hidden">
                    <div className="flex items-center gap-1 p-2">
                      <button className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground flex-shrink-0">
                        <GripVertical className="h-4 w-4" />
                      </button>
                      {visibleColumns.map(col=>(
                        <div key={col.id} style={{ flex:col.width }} className="min-w-0">
                          {col.computed ? (
                            <div className="px-2">
                              <span className="text-sm font-semibold text-primary">{col.computed(line)} €</span>
                              {col.id==="tvaAmount"&&<span className="text-[10px] text-muted-foreground ml-1">({line.tva}%)</span>}
                            </div>
                          ) : col.id==="tva" ? (
                            <select value={String(line[col.id]??20)} onChange={e=>updateLine(line.id,col.id,e.target.value)}
                              className="w-full h-8 text-sm bg-muted/30 border border-border/50 rounded-lg px-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30">
                              {VAT_RATES.map(r=><option key={r} value={r}>{r}%</option>)}
                            </select>
                          ) : col.id==="designation" ? (
                            <SimpleEditable
                              value={String(line[col.id]??"")}
                              onChange={v=>updateLine(line.id,col.id,v)}
                              placeholder="Désignation..."
                            />
                          ) : (
                            <Input type={col.type==="number"||col.type==="currency"||col.type==="percent"?"number":"text"}
                              value={String(line[col.id]??"")} onChange={e=>updateLine(line.id,col.id,e.target.value)}
                              className="h-8 text-sm"
                              placeholder={col.type==="number"?"0":col.type==="currency"?"0.00":""} />
                          )}
                        </div>
                      ))}
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <button onClick={()=>toggleExpand(line.id)}
                          className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
                          {expandedLines.has(line.id)?<ChevronUp className="h-3.5 w-3.5"/>:<ChevronDown className="h-3.5 w-3.5"/>}
                        </button>
                        <button onClick={()=>removeLine(line.id)}
                          className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <AnimatePresence>
                      {expandedLines.has(line.id)&&(
                        <motion.div initial={{ height:0 }} animate={{ height:"auto" }} exit={{ height:0 }} className="overflow-hidden">
                          <div className="px-4 pb-3 pt-1 border-t border-border/40 bg-muted/10">
                            <Label className="text-[10px] text-muted-foreground mb-1.5 block">+ Description détaillée</Label>
                            <RichTextAreaCompact value={String(line.description??"")} onChange={v=>updateLine(line.id,"description",v)}
                              placeholder="Détails de la prestation..." rows={3} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>

          {/* ── TOTAUX ────────────────────────────────────────────────────────── */}
          <div className="flex justify-end">
            <div className="w-60 space-y-1.5 p-4 bg-muted/20 rounded-xl border border-border/60">
              {[
                { label:"Total HT",  val:totalHT.toFixed(2),  bold:false },
                { label:"TVA",       val:totalTVA.toFixed(2), bold:false },
                { label:"Total TTC", val:totalTTC.toFixed(2), bold:true  },
              ].map(({ label,val,bold })=>(
                <div key={label} className={`flex justify-between items-center py-1 ${bold?"border-t border-border pt-2 mt-1":""}`}>
                  <span className={`text-sm ${bold?"font-bold":"text-muted-foreground"}`}>{label}</span>
                  <span className={`text-sm ${bold?"font-bold text-primary":""}`}>{val} €</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── BLOCS OPTIONNELS ────────────────────────────────────────────── */}
          <div className="space-y-3">
            <Reorder.Group axis="y" values={blocks} onReorder={setBlocks} className="space-y-3">
              {blocks.map(block=>{
                const def  = AVAILABLE_BLOCKS.find(b=>b.type===block.type);
                const Icon = def?.icon ?? AlignLeft;
                const isPage = block.type==="extra_page";
                return (
                  <Reorder.Item key={block.id} value={block}>
                    <motion.div layout className={`border rounded-xl bg-card overflow-hidden ${isPage?"border-primary/30 bg-primary/5":"border-border/60"}`}>
                      <div className="flex items-center gap-2 px-3 py-2 bg-muted/20 border-b border-border/40">
                        <button className="cursor-grab text-muted-foreground/40"><GripVertical className="h-4 w-4"/></button>
                        <Icon className={`h-3.5 w-3.5 ${isPage?"text-primary":""}`} style={!isPage?{color:design.primaryColor}:{}}/>
                        {/* Label éditable pour blocs custom */}
                        {(block.type==="custom"||block.type==="footer"||block.type==="extra_page") ? (
                          <input value={block.label} onChange={e=>updateBlockLabel(block.id,e.target.value)}
                            className="flex-1 text-xs font-medium bg-transparent border-0 outline-none focus:outline-none" />
                        ) : (
                          <span className="text-xs font-medium flex-1">{block.label}</span>
                        )}
                        {isPage&&<span className="text-[9px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">Page</span>}
                        <button onClick={()=>removeBlock(block.id)}
                          className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                          <X className="h-3 w-3"/>
                        </button>
                      </div>
                      {block.type!=="signature"&&block.type!=="stamp"&&(
                        <div className="p-3">
                          <RichTextArea value={block.content} onChange={v=>updateBlock(block.id,v)}
                            placeholder={
                              block.type==="footer" ? "Informations de pied de page (société, mentions légales, coordonnées...)" :
                              block.type==="extra_page" ? "Contenu de cette page supplémentaire..." :
                              block.type==="custom" ? "Contenu de ce bloc personnalisé..." :
                              def?.defaultContent
                            }
                            rows={block.type==="extra_page"?10:3} />
                        </div>
                      )}
                      {block.type==="signature"&&(
                        <div className="p-3">
                          <div className="h-20 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground text-xs gap-2">
                            <PenLine className="h-4 w-4"/>Espace signature électronique
                          </div>
                        </div>
                      )}
                      {block.type==="stamp"&&(
                        <div className="p-3 flex gap-3 items-center">
                          <div className="h-20 w-20 border-2 border-dashed border-border rounded-full flex items-center justify-center text-muted-foreground text-[10px] text-center">
                            <Stamp className="h-5 w-5"/>
                          </div>
                          <Button variant="outline" size="sm" className="text-xs h-7">
                            <Image className="h-3 w-3 mr-1"/>Importer tampon
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>

            {/* ── Bouton ajouter bloc — couleur adoucie ── */}
            <div className="relative">
              <button
                className="w-full h-9 text-xs rounded-lg border border-dashed border-border/70
                           text-muted-foreground hover:text-foreground hover:border-border
                           hover:bg-muted/30 transition-all flex items-center justify-center gap-2"
                onClick={()=>setShowBlockMenu(!showBlockMenu)}>
                <Plus className="h-3.5 w-3.5"/>Ajouter un bloc
              </button>
              <AnimatePresence>
                {showBlockMenu&&(
                  <motion.div initial={{ opacity:0,y:-4 }} animate={{ opacity:1,y:0 }}
                    exit={{ opacity:0,y:-4 }}
                    className="absolute bottom-10 left-0 right-0 z-50 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-border/60">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Choisir un bloc</p>
                      <button onClick={()=>setShowBlockMenu(false)}
                        className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        <X className="h-3 w-3"/>
                      </button>
                    </div>

                    {/* Input label pour bloc custom */}
                    <AnimatePresence>
                      {showCustomLabelInput&&(
                        <motion.div initial={{ height:0,opacity:0 }} animate={{ height:"auto",opacity:1 }}
                          exit={{ height:0,opacity:0 }}
                          className="overflow-hidden border-b border-border/60">
                          <div className="p-3 flex gap-2">
                            <Input value={pendingCustomLabel} onChange={e=>setPendingCustomLabel(e.target.value)}
                              placeholder="Nom du bloc personnalisé..."
                              className="h-7 text-xs flex-1"
                              onKeyDown={e=>e.key==="Enter"&&addBlock("custom",pendingCustomLabel||undefined)} />
                            <Button size="sm" className="h-7 text-xs px-3"
                              onClick={()=>addBlock("custom",pendingCustomLabel||undefined)}>
                              Ajouter
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="p-2 grid grid-cols-2 gap-1">
                      {availableBlockTypes.map(ab=>(
                        <button key={ab.type}
                          onClick={()=>{
                            if (ab.type==="custom") {
                              setShowCustomLabelInput(true);
                            } else {
                              addBlock(ab.type);
                            }
                          }}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left
                            ${ab.type==="extra_page"?"border border-primary/20 bg-primary/5 hover:bg-primary/10":""}
                            ${ab.type==="footer"?"border border-amber-200/50 bg-amber-50/30 dark:bg-amber-900/10 hover:bg-amber-50/50":""}
                          `}>
                          <ab.icon className={`h-4 w-4 flex-shrink-0
                            ${ab.type==="extra_page"?"text-primary":""}
                            ${ab.type==="footer"?"text-amber-600":"text-muted-foreground"}
                          `}/>
                          <div>
                            <span className="text-xs block">{ab.label}</span>
                            {ab.type==="extra_page"&&<span className="text-[9px] text-primary">Nouvelle page intégrée</span>}
                            {ab.type==="footer"&&<span className="text-[9px] text-amber-600">Bas de chaque page</span>}
                            {ab.type==="custom"&&<span className="text-[9px] text-muted-foreground">Titre personnalisable</span>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ════ APERÇU PDF DROITE ═════════════════════════════════════════════ */}
        <div className="w-1/2 overflow-y-auto bg-muted/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground"/>
              <span className="text-sm font-medium">Aperçu temps réel</span>
              {(() => {
                const autoPages = lines.length > ROWS_PAGE_1 ? Math.ceil((lines.length - ROWS_PAGE_1) / ROWS_PER_PAGE) : 0;
                const totalPgs = 1 + autoPages + blocks.filter(b=>b.type==="extra_page").length;
                return totalPgs > 1 ? (
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {totalPgs} pages
                  </span>
                ) : null;
              })()}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse"/>
                <span className="text-[10px] text-muted-foreground">Synchronisé</span>
              </div>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={handlePrint}>
                <Printer className="h-3 w-3"/>Imprimer
              </Button>
            </div>
          </div>
          <PdfPreview
            title={title} lines={lines} columns={columns} blocks={blocks}
            design={design} invoiceNumber={invoiceNumber} issueDate={issueDate}
            dueDate={dueDate} sellerInfo={sellerInfo} buyerInfo={buyerInfo}
          />
        </div>
      </div>
    </div>
  );
}
