import React from 'react';
import {
  Table,
  TableBody,
  TableHeader,
  TableHead,
  TableCell,
  TableRow,
} from '@components/ui/table';
import { ZoneFile } from '@bns-x/client';
import { Truncated } from '@components/p/name/fields';
import { DuplicateIcon } from '@components/icons/duplicate';

const CopyableRow: React.FC<{ type: string; label: string; value: string }> = ({
  type,
  label,
  value,
}) => {
  return (
    <TableRow key={label}>
      <TableCell>{type}</TableCell>
      <TableCell>{label}</TableCell>
      <TableCell>
        <div className="flex gap-3 items-center">
          <Truncated>{value}</Truncated>
          <DuplicateIcon clipboardText={value} />
        </div>
      </TableCell>
    </TableRow>
  );
};

export const ZonefileTable: React.FC<{ children?: React.ReactNode; zonefile?: string }> = ({
  zonefile: _zf = '',
}) => {
  const zonefile = new ZoneFile(_zf).zoneFile;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead></TableHead>
          <TableHead>Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Origin</TableCell>
          <TableCell></TableCell>
          <TableCell>{zonefile.$origin}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>TTL</TableCell>
          <TableCell></TableCell>
          <TableCell>{zonefile.$ttl}</TableCell>
        </TableRow>
        {(zonefile.uri ?? []).map(uriRec => (
          <CopyableRow
            type="URI"
            label={uriRec.name}
            value={uriRec.target}
            key={`${uriRec.name}-${uriRec.target}`}
          />
        ))}
        {(zonefile.txt ?? []).map(txtRec => {
          if (typeof txtRec.txt === 'string') {
            return (
              <CopyableRow type="TXT" label={txtRec.name} value={txtRec.txt} key={txtRec.name} />
            );
          }
          return txtRec.txt.map(txtValue => (
            <CopyableRow
              type="TXT"
              label={txtRec.name}
              value={txtValue}
              key={`${txtRec.name}-${txtValue}`}
            />
          ));
        })}
        {(zonefile.a ?? []).map(aRec => {
          return (
            <CopyableRow
              type="A"
              label={aRec.name}
              value={aRec.ip}
              key={`${aRec.name}-${aRec.ip}`}
            />
          );
        })}
        {(zonefile.aaaa ?? []).map(aRec => {
          return (
            <CopyableRow
              type="AAAA"
              label={aRec.name}
              value={aRec.ip}
              key={`${aRec.name}-${aRec.ip}`}
            />
          );
        })}
        {(zonefile.cname ?? []).map(cnameRec => {
          return (
            <CopyableRow
              type="CNAME"
              label={cnameRec.name}
              value={cnameRec.alias}
              key={`${cnameRec.name}-${cnameRec.alias}`}
            />
          );
        })}
        {(zonefile.mx ?? []).map(mxRec => {
          return (
            <CopyableRow
              type="MX"
              label={mxRec.name}
              value={mxRec.host}
              key={`${mxRec.name}-${mxRec.host}`}
            />
          );
        })}
        {(zonefile.ns ?? []).map(rec => {
          return (
            <CopyableRow
              type="NS"
              label={rec.name}
              value={rec.host}
              key={`${rec.name}-${rec.host}`}
            />
          );
        })}
        {(zonefile.ptr ?? []).map(rec => {
          return (
            <CopyableRow
              type="PTR"
              label={rec.name}
              value={rec.host}
              key={`${rec.name}-${rec.host}`}
            />
          );
        })}
        {zonefile.soa && (
          <CopyableRow
            type="SOA"
            label={zonefile.soa.name ?? ''}
            value={zonefile.soa.rname ?? ''}
          />
        )}
        {(zonefile.spf ?? []).map(rec => {
          return (
            <CopyableRow
              type="SPF"
              label={rec.name}
              value={rec.data}
              key={`${rec.name}-${rec.data}`}
            />
          );
        })}
        {(zonefile.srv ?? []).map(rec => {
          return (
            <CopyableRow
              type="SRV"
              label={rec.name}
              value={rec.target}
              key={`${rec.name}-${rec.target}`}
            />
          );
        })}
      </TableBody>
    </Table>
  );
};
