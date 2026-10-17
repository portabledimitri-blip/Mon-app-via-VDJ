export function generateVdjMapperXml(deviceName = 'loopMIDI Port'): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- VirtualDJ Custom MIDI Mapper for Mobile Phone DJ Controller -->
<!-- Place this file into: Documents/VirtualDJ/Mappers/${deviceName}.xml -->
<mapper device="${deviceName}" author="VirtualDJ Mobile Studio" version="8.5">
  <info>
    <name>VirtualDJ Smartphone Controller</name>
    <description>Mappage complet pour smartphone connecté en MIDI virtuel</description>
    <author>AI Studio</author>
  </info>

  <!-- ================= DECK 1 (Channel 1) ================= -->
  <map value="NOTE 60" channel="1" action="deck 1 play_pause" />
  <map value="NOTE 61" channel="1" action="deck 1 cue" />
  <map value="NOTE 62" channel="1" action="deck 1 sync" />
  <map value="NOTE 64" channel="1" action="deck 1 hot_cue 1" />
  <map value="NOTE 65" channel="1" action="deck 1 hot_cue 2" />
  <map value="NOTE 66" channel="1" action="deck 1 hot_cue 3" />
  <map value="NOTE 67" channel="1" action="deck 1 hot_cue 4" />
  <map value="NOTE 70" channel="1" action="deck 1 loop_in" />
  <map value="NOTE 71" channel="1" action="deck 1 loop_out" />
  <map value="NOTE 72" channel="1" action="deck 1 loop 4" />
  <map value="NOTE 73" channel="1" action="deck 1 loop_half" />
  <map value="NOTE 74" channel="1" action="deck 1 loop_double" />
  <map value="NOTE 75" channel="1" action="deck 1 touchwheel_touch" />

  <map value="CC 1" channel="1" action="deck 1 volume" />
  <map value="CC 2" channel="1" action="deck 1 gain" />
  <map value="CC 3" channel="1" action="deck 1 eq_high" />
  <map value="CC 4" channel="1" action="deck 1 eq_mid" />
  <map value="CC 5" channel="1" action="deck 1 eq_low" />
  <map value="CC 6" channel="1" action="deck 1 pitch" />
  <map value="CC 7" channel="1" action="deck 1 jog" />

  <!-- ================= DECK 2 (Channel 2) ================= -->
  <map value="NOTE 60" channel="2" action="deck 2 play_pause" />
  <map value="NOTE 61" channel="2" action="deck 2 cue" />
  <map value="NOTE 62" channel="2" action="deck 2 sync" />
  <map value="NOTE 64" channel="2" action="deck 2 hot_cue 1" />
  <map value="NOTE 65" channel="2" action="deck 2 hot_cue 2" />
  <map value="NOTE 66" channel="2" action="deck 2 hot_cue 3" />
  <map value="NOTE 67" channel="2" action="deck 2 hot_cue 4" />
  <map value="NOTE 70" channel="2" action="deck 2 loop_in" />
  <map value="NOTE 71" channel="2" action="deck 2 loop_out" />
  <map value="NOTE 72" channel="2" action="deck 2 loop 4" />
  <map value="NOTE 73" channel="2" action="deck 2 loop_half" />
  <map value="NOTE 74" channel="2" action="deck 2 loop_double" />
  <map value="NOTE 75" channel="2" action="deck 2 touchwheel_touch" />

  <map value="CC 1" channel="2" action="deck 2 volume" />
  <map value="CC 2" channel="2" action="deck 2 gain" />
  <map value="CC 3" channel="2" action="deck 2 eq_high" />
  <map value="CC 4" channel="2" action="deck 2 eq_mid" />
  <map value="CC 5" channel="2" action="deck 2 eq_low" />
  <map value="CC 6" channel="2" action="deck 2 pitch" />
  <map value="CC 7" channel="2" action="deck 2 jog" />

  <!-- ================= MIXER & MASTER (Channel 3) ================= -->
  <map value="CC 10" channel="3" action="crossfader" />
  <map value="CC 11" channel="3" action="master_volume" />
  <map value="CC 12" channel="3" action="headphone_mix" />
</mapper>
`;
}

export function downloadXmlFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'application/xml;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
