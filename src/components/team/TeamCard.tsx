import React from "react";
import Image from "next/image";
import { Linkedin, Mail } from "lucide-react";
import { TeamMember } from "@/data/team";

interface TeamCardProps {
  member: TeamMember;
}

export const TeamCard: React.FC<TeamCardProps> = ({ member }) => {
  return (
    <div className="card-soft rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center bg-white border border-gray-100 group transition-all duration-300 hover:shadow-xl">
      {/* Circular Profile Avatar with border */}
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-brand-mint group-hover:border-brand-emerald transition-colors duration-300 shadow-md mb-5 bg-gray-100">
        <Image
          src={member.image}
          alt={member.name}
          fill
          sizes="(max-width: 640px) 112px, 128px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Role Tag */}
      <span className="text-xs font-bold uppercase tracking-wider text-brand-leaf mb-1">
        {member.role}
      </span>

      {/* Member Name */}
      <h3 className="font-heading font-extrabold text-lg sm:text-xl text-brand-pitch mb-2 group-hover:text-brand-emerald transition-colors">
        {member.name}
      </h3>

      {/* Bio */}
      <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-3">
        {member.bio}
      </p>

      {/* Social / Contact links */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-100 w-full justify-center">
        {member.linkedin && (
          <a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-gray-50 hover:bg-brand-mint text-gray-500 hover:text-brand-emerald flex items-center justify-center transition-colors"
            aria-label={`${member.name} LinkedIn`}
          >
            <Linkedin className="w-3.5 h-3.5" />
          </a>
        )}
        {member.email && (
          <a
            href={`mailto:${member.email}`}
            className="w-8 h-8 rounded-full bg-gray-50 hover:bg-brand-mint text-gray-500 hover:text-brand-emerald flex items-center justify-center transition-colors"
            aria-label={`${member.name} Email`}
          >
            <Mail className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
};
