import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import { ResumeContent, ResumeTemplate } from "@/lib/resume";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 11, fontFamily: "Helvetica", color: "#111827" },
  modernPage: { padding: 0, fontSize: 10.5, fontFamily: "Helvetica", color: "#111827" },
  heading: { fontSize: 20, fontWeight: 700 },
  subheading: { fontSize: 12, marginTop: 4, color: "#374151" },
  contacts: { marginTop: 8, fontSize: 9, color: "#4B5563" },
  section: { marginTop: 12 },
  sectionTitle: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 3,
  },
  row: { marginBottom: 6 },
  rowHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  bullet: { marginLeft: 8, marginBottom: 2 },
  modernWrap: { flexDirection: "row", minHeight: "100%" },
  modernMain: { width: "72%", padding: 32 },
  modernSide: { width: "28%", backgroundColor: "#EFF6FF", padding: 20 },
});

const ClassicPdf = ({ content }: { content: ResumeContent }) => (
  <Page size="LETTER" style={styles.page}>
    <Text style={styles.heading}>{content.header.fullName}</Text>
    <Text style={styles.subheading}>{content.header.jobTitle}</Text>
    <Text style={styles.contacts}>
      {[
        content.header.email,
        content.header.phone,
        content.header.location,
        content.header.linkedin,
        content.header.github,
        content.header.portfolio,
      ]
        .filter(Boolean)
        .join(" | ")}
    </Text>

    {content.sections.summary ? (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <Text>{content.summary}</Text>
      </View>
    ) : null}

    {content.sections.experience ? (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Experience</Text>
        {content.experience.map((role) => (
          <View key={role.id} style={styles.row}>
            <View style={styles.rowHeader}>
              <Text>
                {role.role} - {role.company}
              </Text>
              <Text>
                {role.startDate} - {role.endDate}
              </Text>
            </View>
            <Text>{role.location}</Text>
            {role.bullets.map((bullet, idx) => (
              <Text key={idx} style={styles.bullet}>
                • {bullet}
              </Text>
            ))}
          </View>
        ))}
      </View>
    ) : null}

    {content.sections.skills ? (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills</Text>
        {content.skills.map((group) => (
          <Text key={group.id}>
            {group.group}: {group.items.join(", ")}
          </Text>
        ))}
      </View>
    ) : null}
  </Page>
);

const ModernPdf = ({ content }: { content: ResumeContent }) => (
  <Page size="LETTER" style={styles.modernPage}>
    <View style={styles.modernWrap}>
      <View style={styles.modernMain}>
        <Text style={styles.heading}>{content.header.fullName}</Text>
        <Text style={[styles.subheading, { color: "#0369A1" }]}>{content.header.jobTitle}</Text>
        {content.sections.summary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text>{content.summary}</Text>
          </View>
        ) : null}
        {content.sections.experience ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {content.experience.map((role) => (
              <View key={role.id} style={styles.row}>
                <Text>
                  {role.role} - {role.company}
                </Text>
                <Text>
                  {role.startDate} - {role.endDate}
                </Text>
                {role.bullets.map((bullet, idx) => (
                  <Text key={idx} style={styles.bullet}>
                    • {bullet}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        ) : null}
      </View>
      <View style={styles.modernSide}>
        <Text>{content.header.email}</Text>
        <Text>{content.header.phone}</Text>
        <Text>{content.header.location}</Text>
        <Text>{content.header.linkedin}</Text>
        <Text>{content.header.github}</Text>
        <Text>{content.header.portfolio}</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          {content.skills.map((group) => (
            <Text key={group.id}>
              {group.group}: {group.items.join(", ")}
            </Text>
          ))}
        </View>
      </View>
    </View>
  </Page>
);

export const ResumeDocument = ({
  content,
  template,
}: {
  content: ResumeContent;
  template: ResumeTemplate;
}) => (
  <Document>{template === "modern" ? <ModernPdf content={content} /> : <ClassicPdf content={content} />}</Document>
);
