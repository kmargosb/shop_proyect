import {
  SiCloudinary,
  SiDocker,
  SiExpress,
  SiFlydotio,
  SiGimp,
  SiGithub,
  SiGit,
  SiInkscape,
  SiJavascript,
  SiLinux,
  SiNextdotjs,
  SiNodedotjs,
  SiPhotopea,
  SiPostgresql,
  SiPrisma,
  SiRedis,
  SiSocketdotio,
  SiStripe,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
} from 'react-icons/si';
import { VscCode } from 'react-icons/vsc';
import { IconType } from 'react-icons';
import { TbCloudComputing } from 'react-icons/tb';
import { SiDavinciresolve } from 'react-icons/si';
import { SiOpenai } from 'react-icons/si';
import { SiFigma } from 'react-icons/si';

type Tool = {
  name: string;
  category: string;
  icon: IconType;
};

const tools: Tool[] = [
  {
    name: 'Next.js',
    category: 'Frontend',
    icon: SiNextdotjs,
  },
  {
    name: 'TypeScript',
    category: 'Language',
    icon: SiTypescript,
  },
  {
    name: 'JavaScript',
    category: 'Language',
    icon: SiJavascript,
  },
  {
    name: 'Node.js',
    category: 'Runtime',
    icon: SiNodedotjs,
  },
  {
    name: 'Express',
    category: 'Backend',
    icon: SiExpress,
  },
  {
    name: 'Prisma',
    category: 'ORM',
    icon: SiPrisma,
  },
  {
    name: 'PostgreSQL',
    category: 'Database',
    icon: SiPostgresql,
  },
  {
    name: 'Redis',
    category: 'Cache',
    icon: SiRedis,
  },
  {
    name: 'Socket.io',
    category: 'Realtime',
    icon: SiSocketdotio,
  },
  {
    name: 'Stripe',
    category: 'Payments',
    icon: SiStripe,
  },
  {
    name: 'Cloudinary',
    category: 'Media',
    icon: SiCloudinary,
  },
  {
    name: 'Tailwind CSS',
    category: 'UI',
    icon: SiTailwindcss,
  },
  {
    name: 'VS Code',
    category: 'Editor',
    icon: VscCode,
  },
  {
    name: 'Git',
    category: 'Versioning',
    icon: SiGit,
  },
  {
    name: 'GitHub',
    category: 'Repository',
    icon: SiGithub,
  },
  {
    name: 'Docker',
    category: 'Containers',
    icon: SiDocker,
  },
  {
    name: 'Linux',
    category: 'Operating System',
    icon: SiLinux,
  },
  {
    name: 'GIMP',
    category: 'Image Editing',
    icon: SiGimp,
  },
  {
    name: 'Inkscape',
    category: 'Vector Design',
    icon: SiInkscape,
  },
  {
    name: 'Photopea',
    category: 'Photo Editing',
    icon: SiPhotopea,
  },
  {
    name: 'Fly.io',
    category: 'Hosting',
    icon: TbCloudComputing,
  },
  {
    name: 'Vercel',
    category: 'Deployment',
    icon: SiVercel,
  },
  {
    name: 'DaVinci Resolve',
    category: 'Video',
    icon: SiDavinciresolve,
  },
  {
    name: 'OpenAI',
    category: 'AI',
    icon: SiOpenai,
  },
  {
    name: 'Figma',
    category: 'UI Design',
    icon: SiFigma,
  },
];

export default function StackGrid() {
  return (
    <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {tools.map((tool) => {
        const Icon = tool.icon;

        return (
          <div
            key={tool.name}
            className="group rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-5 transition-all duration-300 hover:-translate-y-2 hover:border-white/20"
          >
            <Icon size={38} className="text-neutral-300 transition group-hover:text-white" />

            <h3 className="mt-5 text-base font-medium tracking-wide text-white">{tool.name}</h3>
          </div>
        );
      })}
    </div>
  );
}
