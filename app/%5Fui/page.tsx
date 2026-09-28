'use client';
import { useState } from 'react';
import { Button }        from '@/components/ui/Button';
import { IconButton }    from '@/components/ui/IconButton';
import { VoteButton }    from '@/components/ui/VoteButton';
import { Chip }          from '@/components/ui/Chip';
import { StatusPill, GovPill } from '@/components/ui/StatusPill';
import { ProgressTrack } from '@/components/ui/ProgressTrack';
import { Segmented }     from '@/components/ui/Segmented';
import { CitizenInput, GovInput, GouvTextarea } from '@/components/ui/Input';
import { Card, Thumb }   from '@/components/ui/Card';
import { ListRow }       from '@/components/ui/ListRow';
import { MapPin }        from '@/components/ui/MapPin';
import { BottomSheet }   from '@/components/ui/BottomSheet';
import { Modal }         from '@/components/ui/Modal';
import { Toast }         from '@/components/ui/Toast';
import { Fab }           from '@/components/ui/Fab';
import { Avatar }        from '@/components/ui/Avatar';
import { SectionLabel }  from '@/components/ui/SectionLabel';
import { GS }            from '@/lib/domain/stage-style';
import type { Stage }    from '@/lib/domain/types';

const STAGES: Stage[] = ['reported','community','review','verified','assigned','progress','resolved','closed','rejected'];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ font: '600 11px/1 Outfit,sans-serif', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--cp-ink-3)', marginBottom: 10 }}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
        {children}
      </div>
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: '32px 24px', background: 'var(--cp-bg)', flex: 1, overflow: 'auto', minWidth: 0 }}>
      {children}
    </div>
  );
}

function Components() {
  const [vote, setVote] = useState(false);
  const [seg, setSeg] = useState('all');
  const [chip, setChip] = useState('road');
  const [showToast, setShowToast] = useState(false);
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Row label="Button — primary">
        <Button size="l"><i className="ph-bold ph-camera" />Report an issue</Button>
        <Button>Submit</Button>
        <Button size="s">Submit</Button>
        <Button color="peacock">Track official case</Button>
        <Button color="pulse">In progress</Button>
        <Button color="leaf">Fixed</Button>
        <Button disabled>Disabled</Button>
      </Row>

      <Row label="Button — raised">
        <Button variant="raised" size="l">Support</Button>
        <Button variant="raised"><i className="ph-bold ph-funnel" />Filter</Button>
        <Button variant="raised" size="s">Oppose</Button>
      </Row>

      <Row label="Icon button">
        <IconButton><i className="ph-bold ph-arrow-left" /></IconButton>
        <IconButton><i className="ph-bold ph-x" /></IconButton>
        <IconButton><i className="ph-bold ph-share-network" /></IconButton>
        <IconButton size={36}><i className="ph-bold ph-x" style={{ fontSize: 14 }} /></IconButton>
      </Row>

      <Row label="Vote button">
        <VoteButton count={42} on={vote} onClick={() => setVote(v => !v)} />
        <VoteButton count={7} on={false} />
      </Row>

      <Row label="Chip">
        {['all','road','drain','garbage','light','water'].map(c => (
          <Chip key={c} selected={chip === c} onClick={() => setChip(c)}>{c === 'all' ? 'All' : c.charAt(0).toUpperCase()+c.slice(1)}</Chip>
        ))}
        <Chip icon="ph-funnel">Filter</Chip>
      </Row>

      <Row label="Status pill — citizen">
        {STAGES.map(s => <StatusPill key={s} stage={s} />)}
      </Row>

      <Row label="Status pill — government">
        {Object.entries(GS).map(([k, [label, bg, fg, icon]]) => (
          <GovPill key={k} gsKey={k} label={label} bg={bg} fg={fg} icon={icon} />
        ))}
      </Row>

      <Row label="Progress track">
        {STAGES.filter(s => s !== 'rejected').map(s => (
          <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span style={{ font: '500 10px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{s}</span>
            <ProgressTrack stage={s} />
          </div>
        ))}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <span style={{ font: '500 10px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>rejected</span>
          <ProgressTrack stage="rejected" />
        </div>
      </Row>

      <Row label="Segmented">
        <Segmented
          value={seg}
          onChange={setSeg}
          items={[{ value: 'all', label: 'All' }, { value: 'mine', label: 'My reports' }, { value: 'watch', label: 'Watching' }]}
        />
      </Row>

      <Row label="Input — citizen">
        <CitizenInput label="Search" placeholder="Search issues…" style={{ width: 220 }} />
        <CitizenInput placeholder="No label" style={{ width: 180 }} />
      </Row>

      <Row label="Input — government">
        <GovInput label="Employee ID" placeholder="CHN/EE/2024/001" style={{ width: 240 }} />
      </Row>

      <Row label="Textarea">
        <GouvTextarea label="Add a note" placeholder="Describe the issue or action taken…" rows={3} style={{ width: 300 }} />
      </Row>

      <Row label="Card / list row">
        <Card style={{ width: 300 }}>
          <ListRow>
            <Thumb />
            <div style={{ flex: 1 }}>
              <div style={{ font: '600 14px/1.25 Outfit,sans-serif', marginBottom: 4 }}>Pothole on OMR</div>
              <div style={{ font: '500 12px/1.3 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>Velachery · 0.4 km · 2h ago</div>
            </div>
          </ListRow>
          <ListRow last>
            <Thumb />
            <div style={{ flex: 1 }}>
              <div style={{ font: '600 14px/1.25 Outfit,sans-serif', marginBottom: 4 }}>Drain overflow</div>
              <div style={{ font: '500 12px/1.3 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>Guindy · 1.1 km · 5h ago</div>
            </div>
          </ListRow>
        </Card>
      </Row>

      <Row label="Map pin">
        {(['reported','community','progress','verified','closed'] as Stage[]).map(s => (
          <MapPin key={s} stage={s} label={s.charAt(0).toUpperCase()+s.slice(1)} />
        ))}
        <MapPin stage="progress" label="Hot" hot />
        <MapPin stage="assigned" label="Selected" selected />
      </Row>

      <Row label="Avatar">
        {['Karthik S','Priya M','Arun K','Meena V'].map((n, i) => (
          <Avatar key={n} name={n} index={i} />
        ))}
        <Avatar name="Divya Raghavan" size={40} />
      </Row>

      <Row label="Section label">
        <SectionLabel>Nearby issues</SectionLabel>
        <SectionLabel>Official case</SectionLabel>
        <SectionLabel>Evidence submitted</SectionLabel>
      </Row>

      <Row label="Bottom sheet (preview)">
        <div style={{ width: 300, borderRadius: '26px 26px 0 0', overflow: 'hidden', boxShadow: 'var(--k-sh-sheet)', border: '1px solid var(--cp-line)' }}>
          <BottomSheet title="Nearby issues">
            <div style={{ padding: '0 20px 20px', font: '500 13px/1.4 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>
              Sheet content appears here
            </div>
          </BottomSheet>
        </div>
      </Row>

      <Row label="Toast">
        <Button variant="raised" onClick={() => setShowToast(true)}>Show toast</Button>
        {showToast && <Toast message="Issue reported successfully" onDone={() => setShowToast(false)} />}
      </Row>

      <Row label="Modal">
        <Button variant="raised" onClick={() => setShowModal(true)}>Show modal</Button>
        {showModal && (
          <Modal title="Confirm action" onClose={() => setShowModal(false)} maxWidth={360}>
            <div style={{ padding: '18px 22px', font: '500 13px/1.5 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>
              Are you sure you want to take this action?
            </div>
            <div style={{ padding: '0 22px 18px', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Button variant="raised" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={() => setShowModal(false)}>Confirm</Button>
            </div>
          </Modal>
        )}
      </Row>

      <Row label="FAB">
        <Fab style={{ position: 'relative', right: 'auto', bottom: 'auto' }}>
          <i className="ph-bold ph-camera" style={{ fontSize: 20 }} />
          Report an issue
        </Fab>
      </Row>
    </>
  );
}

export default function UIPage() {
  return (
    <div style={{ fontFamily: 'Outfit,sans-serif', minHeight: '100dvh' }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--cp-line)', background: 'var(--cp-surface)', position: 'sticky', top: 0, zIndex: 10 }}>
        <span style={{ font: '600 16px/1 Outfit,sans-serif' }}>Koodal Design System</span>
        <span style={{ font: '500 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)', marginLeft: 12 }}>/_ui · light left, dark right</span>
      </div>
      <div style={{ display: 'flex' }}>
        <div data-cp-theme="light" style={{ flex: 1, minWidth: 0 }}>
          <Panel><Components /></Panel>
        </div>
        <div style={{ width: 1, background: 'var(--cp-line)', flexShrink: 0 }} />
        <div data-cp-theme="dark" style={{ flex: 1, minWidth: 0 }}>
          <Panel><Components /></Panel>
        </div>
      </div>
    </div>
  );
}
