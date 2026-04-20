"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { faqEntries } from "@/components/landing/data";
import { Reveal } from "@/components/ui/reveal";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="bg-[#f4f2ec] py-20 text-[#111827]" id="faq">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <Reveal className="overflow-hidden rounded-[28px] border border-[#e7dfd0] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
          <div className="bg-[#121a2d] px-6 py-8 text-center text-white sm:px-10 sm:py-10">
            <p className="text-[2.9rem] font-bold tracking-[0.04em] text-[#f7c85f] sm:text-[4rem]">
              F.A.Q
            </p>
            <p className="mt-2 text-lg text-white/80 sm:text-[1.05rem]">
              Pertanyaan yang Sering Diajukan
            </p>
          </div>

          <div className="bg-white">
            {faqEntries.map((entry, index) => (
              <Reveal delay={index * 0.04} key={entry.question}>
                <div className="border-b border-[#ece7dd] last:border-b-0">
                  <button
                    aria-controls={`faq-panel-${index}`}
                    aria-expanded={openIndex === index}
                    className={`flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-[1.05rem] font-medium transition duration-300 sm:px-7 sm:text-[1.15rem] ${
                      openIndex === index
                        ? "bg-[#121a2d] text-[#f6c85d]"
                        : "text-[#1f2937] hover:bg-[#fbfaf7]"
                    }`}
                    onClick={() => setOpenIndex((current) => (current === index ? -1 : index))}
                    type="button"
                  >
                    <span>{entry.question}</span>
                    <motion.span
                      animate={{ rotate: openIndex === index ? 180 : 0 }}
                      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center ${
                        openIndex === index ? "text-[#f6c85d]" : "text-[#1f2937]"
                      }`}
                      transition={{ duration: 0.22 }}
                    >
                      <ChevronDown className="h-4 w-4" strokeWidth={2.4} />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {openIndex === index ? (
                      <motion.div
                        animate={{ height: "auto", opacity: 1 }}
                        className="overflow-hidden"
                        exit={{ height: 0, opacity: 0 }}
                        id={`faq-panel-${index}`}
                        initial={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="bg-[#fbfaf7] px-6 pb-5 pt-4 text-[0.98rem] leading-8 text-[#5b6474] sm:px-7">
                          {entry.answer}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
