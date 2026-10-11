"use client";

import React from "react";
import Image from "next/image";
import { Mail, Sparkles, Crown, Award, Users } from "lucide-react";
import { founderMember, presidentMember, coreTeamMembers, TeamMember } from "@/data/team";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface TeamCardProps {
  member: TeamMember;
  featured?: boolean;
  badgeLabel?: string;
}

export const LeadershipCard: React.FC<TeamCardProps> = ({
  member,
  featured = false,
  badgeLabel,
}) => {
  const isFounder = member.category === "founder";

  return (
    <div
      className={`relative mx-auto w-full max-w-md rounded-3xl p-8 sm:p-10 text-center transition-all duration-300 hover:shadow-2xl ${
        isFounder
          ? "bg-gradient-to-b from-white via-emerald-50/40 to-white border-2 border-brand-emerald/30 shadow-xl"
          : "bg-white border-2 border-brand-mint shadow-lg hover:border-brand-emerald/40"
      }`}
    >
      {/* Decorative top badge */}
      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
        <span
          className={`inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
            isFounder
              ? "bg-brand-emerald text-white"
              : "bg-brand-mint text-brand-forest border border-brand-emerald/20"
          }`}
        >
          {isFounder ? <Crown className="w-3.5 h-3.5" /> : <Award className="w-3.5 h-3.5" />}
          {badgeLabel || member.role}
        </span>
      </div>

      {/* Avatar */}
      <div className="relative mx-auto mt-2 mb-6">
        <div
          className={`relative mx-auto rounded-full overflow-hidden shadow-md transition-transform duration-300 hover:scale-105 ${
            isFounder
              ? "w-36 h-36 sm:w-40 sm:h-40 border-4 border-brand-emerald ring-4 ring-brand-mint"
              : "w-32 h-32 sm:w-36 sm:h-36 border-4 border-brand-mint ring-2 ring-brand-emerald/20"
          }`}
        >
          <Image
            src={member.image}
            alt={member.name}
            fill
            sizes="(max-width: 640px) 160px, 180px"
            className="object-cover"
            priority={isFounder}
          />
        </div>
      </div>

      {/* Role */}
      <p className="text-xs font-bold uppercase tracking-wider text-brand-leaf mb-1">
        {member.role}
      </p>

      {/* Name */}
      <h3 className="font-heading font-black text-2xl sm:text-3xl text-brand-pitch mb-3">
        {member.name}
      </h3>

      {/* Bio */}
      <p className="text-gray-600 text-sm leading-relaxed mb-6 max-w-sm mx-auto">
        {member.bio}
      </p>

      {/* Contact button */}
      <div className="pt-4 border-t border-gray-100 flex items-center justify-center">
        {member.email && (
          <a
            href={`mailto:${member.email}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-brand-mint hover:bg-brand-emerald hover:text-white text-brand-forest transition-colors shadow-xs"
            aria-label={`Email ${member.name}`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Connect via Email</span>
          </a>
        )}
      </div>
    </div>
  );
};

export const CoreMemberCard: React.FC<{ member: TeamMember }> = ({ member }) => {
  return (
    <div className="rounded-3xl p-6 sm:p-7 flex flex-col items-center text-center bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-brand-mint transition-all duration-300 group">
      {/* Profile Avatar */}
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-brand-mint group-hover:border-brand-emerald transition-colors duration-300 shadow-sm mb-5 bg-gray-50">
        <Image
          src={member.image}
          alt={member.name}
          fill
          sizes="(max-width: 640px) 112px, 128px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Role Tag */}
      <span className="text-xs font-bold uppercase tracking-wider text-brand-leaf mb-1 text-center min-h-[32px] flex items-center justify-center">
        {member.role}
      </span>

      {/* Member Name */}
      <h4 className="font-heading font-bold text-lg text-brand-pitch mb-2 group-hover:text-brand-emerald transition-colors">
        {member.name}
      </h4>

      {/* Bio */}
      <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-4 flex-1">
        {member.bio}
      </p>

      {/* Contact link */}
      {member.email && (
        <div className="pt-3 border-t border-gray-100 w-full flex justify-center">
          <a
            href={`mailto:${member.email}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-brand-emerald transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>{member.email}</span>
          </a>
        </div>
      )}
    </div>
  );
};

export const TeamSection: React.FC<{ isStandalone?: boolean }> = ({
  isStandalone = false,
}) => {
  return (
    <section className={isStandalone ? "py-12 sm:py-16" : "py-16 sm:py-24 bg-brand-cream/60"}>
      <Container size="wide">
        {/* Section Heading */}
        <SectionHeading
          badge="Leadership & Organizers"
          title="Our Team"
          urduSubtitle="تعمیرِ ریختہ کے رہبر"
          description="Meet the passionate youth leadership driving Ta'meer-e-Rekhta's cultural revival and humanitarian missions across Pakistan."
          align="center"
        />

        <div className="space-y-16 mt-12 sm:mt-16">
          {/* TIER 1: FOUNDER IN THE MIDDLE */}
          <div className="space-y-4">
            <div className="text-center">
              <span className="text-xs font-bold tracking-widest text-brand-emerald uppercase inline-flex items-center gap-1.5 bg-brand-mint/60 px-3.5 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5" /> Organization Founder
              </span>
            </div>
            <LeadershipCard member={founderMember} featured={true} badgeLabel="Founder" />
          </div>

          {/* TIER 2: PRESIDENT IN THE MIDDLE */}
          <div className="space-y-4">
            <div className="text-center">
              <span className="text-xs font-bold tracking-widest text-brand-leaf uppercase inline-flex items-center gap-1.5 bg-gray-100 px-3.5 py-1 rounded-full">
                <Award className="w-3.5 h-3.5" /> Executive Leadership
              </span>
            </div>
            <LeadershipCard member={presidentMember} featured={false} badgeLabel="President" />
          </div>

          {/* TIER 3: CORE TEAM MEMBERS */}
          <div className="space-y-8 pt-6">
            <div className="text-center max-w-xl mx-auto">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-pitch bg-white px-4 py-1.5 rounded-full border border-gray-200 shadow-xs mb-3">
                <Users className="w-3.5 h-3.5 text-brand-emerald" />
                <span>Core Team Members</span>
              </div>
              <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-brand-pitch">
                Department Heads &amp; Coordinators
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">
                The dedicated leaders spearheading welfare, finance, literature, media, and marketing.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {coreTeamMembers.map((member) => (
                <CoreMemberCard key={member.id} member={member} />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
