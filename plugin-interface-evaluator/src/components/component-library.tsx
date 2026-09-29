import { Button } from "./ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion"
import type { JSX } from "react/jsx-runtime"
import { Alert, AlertTitle, AlertDescription } from "./ui/alert"
import { Badge } from "./ui/badge"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./ui/card"
import { Checkbox } from "./ui/checkbox"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "./ui/dropdown-menu"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
} from "./ui/menubar"
import {
  Progress,
  ProgressTrack,
  ProgressIndicator,
} from "./ui/progress"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "./ui/resizable"
import { ScrollArea } from "./ui/scroll-area"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select"
import { Separator } from "./ui/separator"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "./ui/sheet"
import { Skeleton } from "./ui/skeleton"
import { Slider } from "./ui/slider"
import { Switch } from "./ui/switch"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "./ui/tabs"
import { Textarea } from "./ui/textarea"
import { Toggle } from "./ui/toggle"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "./ui/tooltip"

/**
 * Entry in the component registry
 * `id`: unique key of the component type
 * `label`: name shown in the sidebar
 * `category`: sidebar group, e.g. "Actions" or "Form"
 * `defaultProps`: initial props, not used for rendering yet
 * `preview()`: compact version in the sidebar
 * `render()`: full version on the canvas
 */
export interface ComponentItem {
    id: string
    label: string
    category: string
    defaultProps: Record<string, unknown>
    preview: () => JSX.Element
    render: () => JSX.Element
}

// Registry of all components, new entries need a unique id, preview() and render() and show up in the sidebar automatically
export const COMPONENT_LIBRARY = [
   /* Here all needed components that should be available in the canvas and sidebar should be listed */
   // ── Actions ──────────────────────────────────────────────────
  {
    id: "button-primary",
    label: "Button (Primary)",
    category: "Actions",
    defaultProps: { children: "Click me", variant: "default" },
    render: () => <Button variant="default">Click me</Button>,
    preview: () => <Button variant="default">Click me</Button>,
  },
/*   {
    id: "button-secondary",
    label: "Button (Secondary)",
    category: "Actions",
    defaultProps: { children: "Click me", variant: "secondary" },
    render: () => <Button variant="secondary">Click me</Button>,
    preview: () => <Button variant="secondary">Click me</Button>,
  },
  {
    id: "button-outline",
    label: "Button (Outline)",
    category: "Actions",
    defaultProps: { children: "Click me", variant: "outline" },
    render: () => <Button variant="outline">Click me</Button>,
    preview: () => <Button variant="outline">Click me</Button>,
  },
  {
    id: "button-ghost",
    label: "Button (Ghost)",
    category: "Actions",
    defaultProps: { children: "Click me", variant: "ghost" },
    render: () => <Button variant="ghost">Click me</Button>,
    preview: () => <Button variant="ghost">Click me</Button>,
  },
  {
    id: "button-destructive",
    label: "Button (Destructive)",
    category: "Actions",
    defaultProps: { children: "Delete", variant: "destructive" },
    render: () => <Button variant="destructive">Delete</Button>,
    preview: () => <Button variant="destructive">Delete</Button>,
  }, */
  {
    id: "toggle",
    label: "Toggle",
    category: "Actions",
    defaultProps: {},
    render: () => <Toggle>Toggle me</Toggle>,
    preview: () => <Toggle>Toggle me</Toggle>,
  },
  {
    id: "badge-default",
    label: "Badge (Default)",
    category: "Actions",
    defaultProps: { variant: "default" },
    render: () => <Badge>Default</Badge>,
    preview: () => <Badge>Default</Badge>,
  },
 /*  {
    id: "badge-secondary",
    label: "Badge (Secondary)",
    category: "Actions",
    defaultProps: { variant: "secondary" },
    render: () => <Badge variant="secondary">Secondary</Badge>,
    preview: () => <Badge variant="secondary">Secondary</Badge>,
  },
  {
    id: "badge-outline",
    label: "Badge (Outline)",
    category: "Actions",
    defaultProps: { variant: "outline" },
    render: () => <Badge variant="outline">Outline</Badge>,
    preview: () => <Badge variant="outline">Outline</Badge>,
  },
  {
    id: "badge-destructive",
    label: "Badge (Destructive)",
    category: "Actions",
    defaultProps: { variant: "destructive" },
    render: () => <Badge variant="destructive">Destructive</Badge>,
    preview: () => <Badge variant="destructive">Destructive</Badge>,
  }, */

  // ── Form ─────────────────────────────────────────────────────
  {
    id: "input",
    label: "Input",
    category: "Form",
    defaultProps: { placeholder: "Type something…" },
    render: () => <Input placeholder="Type something…" />,
    preview: () => <Input placeholder="Type something…" />,
  },
  {
    id: "textarea",
    label: "Textarea",
    category: "Form",
    defaultProps: { placeholder: "Enter text…" },
    render: () => <Textarea placeholder="Enter text…" />,
    preview: () => <Textarea placeholder="Enter text…" />,
  },
  {
    id: "label",
    label: "Label",
    category: "Form",
    defaultProps: { children: "Label" },
    render: () => <Label>Label text</Label>,
    preview: () => <Label>Label text</Label>,
  },
  {
    id: "checkbox",
    label: "Checkbox",
    category: "Form",
    defaultProps: {},
    render: () => (
      <div className="flex items-center gap-2">
        <Checkbox id="cb-demo" />
        <Label htmlFor="cb-demo">Accept terms</Label>
      </div>
    ),
    preview: () => (
      <div className="flex items-center gap-2">
        <Checkbox id="cb-preview" />
        <Label htmlFor="cb-preview">Accept terms</Label>
      </div>
    ),
  },
  {
    id: "radio-group",
    label: "Radio Group",
    category: "Form",
    defaultProps: {},
    render: () => (
      <RadioGroup defaultValue="option-1">
        <div className="flex items-center gap-2">
          <RadioGroupItem value="option-1" id="r1" />
          <Label htmlFor="r1">Option 1</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="option-2" id="r2" />
          <Label htmlFor="r2">Option 2</Label>
        </div>
      </RadioGroup>
    ),
    preview: () => (
      <RadioGroup defaultValue="option-1">
        <div className="flex items-center gap-2">
          <RadioGroupItem value="option-1" id="r1-p" />
          <Label htmlFor="r1-p">Option 1</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="option-2" id="r2-p" />
          <Label htmlFor="r2-p">Option 2</Label>
        </div>
      </RadioGroup>
    ),
  },
  {
    id: "switch",
    label: "Switch",
    category: "Form",
    defaultProps: {},
    render: () => (
      <div className="flex items-center gap-2">
        <Switch id="sw-demo" />
        <Label htmlFor="sw-demo">Enable feature</Label>
      </div>
    ),
    preview: () => (
      <div className="flex items-center gap-2">
        <Switch id="sw-preview" />
        <Label htmlFor="sw-preview">Enable feature</Label>
      </div>
    ),
  },
  {
    id: "slider",
    label: "Slider",
    category: "Form",
    defaultProps: { defaultValue: [50], max: 100, step: 1 },
    render: () => <Slider defaultValue={[50]} max={100} step={1} className="w-48" />,
    preview: () => <Slider defaultValue={[50]} max={100} step={1} className="w-48" />,
  },
  {
    id: "select",
    label: "Select",
    category: "Form",
    defaultProps: {},
    render: () => (
      <Select>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Pick one…" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="cherry">Cherry</SelectItem>
        </SelectContent>
      </Select>
    ),
    preview: () => (
      <Select>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Pick one…" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="cherry">Cherry</SelectItem>
        </SelectContent>
      </Select>
    ),
  },

  // ── Layout ───────────────────────────────────────────────────
  {
    id: "accordion",
    label: "Accordion",
    category: "Layout",
    defaultProps: {},
    render: () => (
      <Accordion defaultValue={["item-1"]}>
        <AccordionItem value="item-1">
          <AccordionTrigger>Is it accessible?</AccordionTrigger>
          <AccordionContent>
            Yes. It adheres to the WAI-ARIA design pattern.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Is it styled?</AccordionTrigger>
          <AccordionContent>
            Yes. It comes with default styles that match the other components.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    ),
    preview: () => (
      <Accordion defaultValue={["item-1"]}>
        <AccordionItem value="item-1">
          <AccordionTrigger>Is it accessible?</AccordionTrigger>
          <AccordionContent>
            Yes. It adheres to the WAI-ARIA design pattern.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    ),
  },
  {
    id: "card",
    label: "Card",
    category: "Layout",
    defaultProps: {},
    render: () => (
      <Card className="w-64">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description goes here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">This is the card content area.</p>
        </CardContent>
        <CardFooter>
          <Button size="sm">Action</Button>
        </CardFooter>
      </Card>
    ),
    preview: () => (
      <Card className="w-64">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description goes here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">This is the card content area.</p>
        </CardContent>
        <CardFooter>
          <Button size="sm">Action</Button>
        </CardFooter>
      </Card>
    ),
  },
  {
    id: "separator",
    label: "Separator",
    category: "Layout",
    defaultProps: {},
    render: () => (
      <div className="w-48">
        <p className="text-sm">Above</p>
        <Separator className="my-2" />
        <p className="text-sm">Below</p>
      </div>
    ),
    preview: () => (
      <div className="w-48">
        <p className="text-sm">Above</p>
        <Separator className="my-2" />
        <p className="text-sm">Below</p>
      </div>
    ),
  },
  {
    id: "tabs",
    label: "Tabs",
    category: "Layout",
    defaultProps: {},
    render: () => (
      <Tabs defaultValue="tab1" className="w-64">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content for tab 1</TabsContent>
        <TabsContent value="tab2">Content for tab 2</TabsContent>
        <TabsContent value="tab3">Content for tab 3</TabsContent>
      </Tabs>
    ),
    preview: () => (
      <Tabs defaultValue="tab1" className="w-64">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content for tab 1</TabsContent>
        <TabsContent value="tab2">Content for tab 2</TabsContent>
        <TabsContent value="tab3">Content for tab 3</TabsContent>
      </Tabs>
    ),
  },
  {
    id: "scroll-area",
    label: "Scroll Area",
    category: "Layout",
    defaultProps: {},
    render: () => (
      <ScrollArea className="h-32 w-48 rounded border p-2">
        {Array.from({ length: 10 }, (_, i) => (
          <p key={i} className="text-sm">Item {i + 1}</p>
        ))}
      </ScrollArea>
    ),
    preview: () => (
      <ScrollArea className="h-32 w-48 rounded border p-2">
        {Array.from({ length: 10 }, (_, i) => (
          <p key={i} className="text-sm">Item {i + 1}</p>
        ))}
      </ScrollArea>
    ),
  },
  {
    id: "resizable",
    label: "Resizable Panels",
    category: "Layout",
    defaultProps: {},
    render: () => (
      <ResizablePanelGroup orientation="horizontal" className="h-24 w-64 rounded border">
        <ResizablePanel defaultSize={50}>
          <div className="flex h-full items-center justify-center p-2 text-sm">Left</div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50}>
          <div className="flex h-full items-center justify-center p-2 text-sm">Right</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    ),
    preview: () => (
      <ResizablePanelGroup orientation="horizontal" className="h-24 w-64 rounded border">
        <ResizablePanel defaultSize={50}>
          <div className="flex h-full items-center justify-center p-2 text-sm">Left</div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50}>
          <div className="flex h-full items-center justify-center p-2 text-sm">Right</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    ),
  },

  // ── Feedback ─────────────────────────────────────────────────
  {
    id: "alert-default",
    label: "Alert (Default)",
    category: "Feedback",
    defaultProps: { variant: "default" },
    render: () => (
      <Alert variant="default">
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>You can add components to your app.</AlertDescription>
      </Alert>
    ),
    preview: () => (
      <Alert variant="default">
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>You can add components to your app.</AlertDescription>
      </Alert>
    ),
  },
  {
    id: "alert-destructive",
    label: "Alert (Destructive)",
    category: "Feedback",
    defaultProps: { variant: "destructive" },
    render: () => (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Something went wrong.</AlertDescription>
      </Alert>
    ),
    preview: () => (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Something went wrong.</AlertDescription>
      </Alert>
    ),
  },
  {
    id: "progress",
    label: "Progress",
    category: "Feedback",
    defaultProps: { value: 60 },
    render: () => (
      <Progress value={60} className="w-48">
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
    ),
    preview: () => (
      <Progress value={60} className="w-48">
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
    ),
  },
  {
    id: "skeleton",
    label: "Skeleton",
    category: "Feedback",
    defaultProps: {},
    render: () => (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-36" />
      </div>
    ),
    preview: () => (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-36" />
      </div>
    ),
  },
  {
    id: "tooltip",
    label: "Tooltip",
    category: "Feedback",
    defaultProps: {},
    render: () => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger render={<Button variant="outline" />}>
            Hover me
          </TooltipTrigger>
          <TooltipContent>This is a tooltip</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
    preview: () => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger render={<Button variant="outline" />}>
            Hover me
          </TooltipTrigger>
          <TooltipContent>This is a tooltip</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },

  // ── Overlay ──────────────────────────────────────────────────
  {
    id: "dialog",
    label: "Dialog",
    category: "Overlay",
    defaultProps: {},
    render: () => (
      <Dialog>
        <DialogTrigger render={<Button variant="outline" />}>
          Open Dialog
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>
              This is the dialog description.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    ),
    preview: () => (
      <Dialog>
        <DialogTrigger render={<Button variant="outline" />}>
          Open Dialog
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>
              This is the dialog description.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    ),
  },
  {
    id: "sheet",
    label: "Sheet",
    category: "Overlay",
    defaultProps: {},
    render: () => (
      <Sheet>
        <SheetTrigger render={<Button variant="outline" />}>
          Open Sheet
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>
              This is the sheet description.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    ),
    preview: () => (
      <Sheet>
        <SheetTrigger render={<Button variant="outline" />}>
          Open Sheet
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>
              This is the sheet description.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    ),
  },
  {
    id: "dropdown-menu",
    label: "Dropdown Menu",
    category: "Overlay",
    defaultProps: {},
    render: () => (
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" />}>
          Open Menu
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    preview: () => (
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" />}>
          Open Menu
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
  {
    id: "menubar",
    label: "Menubar",
    category: "Overlay",
    defaultProps: {},
    render: () => (
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
            <MenubarItem>Open</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Save</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Undo</MenubarItem>
            <MenubarItem>Redo</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    ),
    preview: () => (
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
            <MenubarItem>Open</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Save</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Undo</MenubarItem>
            <MenubarItem>Redo</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    ),
  },
]

// COMPONENT_LIBRARY grouped by category, e.g. { "Actions": [...], "Form": [...] }
export const COMPONENT_BY_CATEGORY = COMPONENT_LIBRARY.reduce(
  (components, item) => {
    if (!components[item.category]) {
      components[item.category] = [];
    }
    components[item.category].push(item);
    return components;
  },
  {} as Record<string, ComponentItem[]>
)